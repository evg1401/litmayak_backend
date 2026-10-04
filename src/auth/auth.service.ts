import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  GenerateCodeRequestDto,
  SignInCodeRequestDto,
} from './dto/auth.request.dto';
import { AuthCodeEventsService } from './auth_code_events.service';
import { AuthTokens, Authors, Users } from '@models';
import slugConverter from 'slug';
import { createHash, randomBytes } from 'node:crypto';
import { Channels } from '@/notifications/dto/notifications.dto';
import { NotificationsService } from '@/notifications/notifications.service';
import { InjectModel } from '@nestjs/sequelize';
import { Roles } from 'libs/models/roles.model';
import { UserRoles } from '@/common/constants/roles.constants';
import { UserStatus } from '@/common/constants/user_status.constants';
import { generateJwt, JwtTypes, validateJwt } from 'configs/jwt.config';
import type { AuthOpts, JwtTokens } from 'configs/jwt.config';
import { literal, Op, Transaction } from 'sequelize';
import { JwtPayload } from 'jsonwebtoken';
import { AuthLogPending } from './dto/auth_code_events.dto';
import {
  AdvisoryLockNamespace,
  isTimeExpired,
  isTimeOver,
  lockByKey,
  whereEmailIgnoreCase,
} from '@/helpers';

const WRONG_CODE_MESSAGE = 'Введен неверный код авторизации';
const REFRESH_CODE_ERROR_MESSAGE =
  'ошибка обновления кода: запросите код заново';

@Injectable()
export class AuthService {
  constructor(
    protected authCodeEventsService: AuthCodeEventsService,
    protected notificationsService: NotificationsService,
    @InjectModel(Users) protected usersRepository: typeof Users,
    @InjectModel(AuthTokens) protected authTokensRepository: typeof AuthTokens,
    @InjectModel(Roles) protected rolesRepository: typeof Roles,
    @InjectModel(Authors) protected authorsRepository: typeof Authors,
    @Inject('AUTH_CONFIG') private authConfig: AuthOpts,
  ) {}

  async generateAuthCode(
    { phone, email, channel }: GenerateCodeRequestDto,
    deviceUid: string,
  ): Promise<boolean> {
    const code = this.generateCode();
    const identifier = this.getIdentifierValue({ phone, email });

    if (!(await this.isPossibilityResend(identifier, channel, deviceUid))) {
      throw new Error(
        'Повторный запрос кода авторизации доступен раз в 60 сек для каждого способа получения',
      );
    }

    await this.reserveCodeIssue(
      identifier,
      deviceUid,
      channel,
      'generate_code',
    );

    const foundUser = await this.usersRepository.findOne({
      where: this.getIdentifierWhere({ phone, email }),
    });
    if (!foundUser) {
      await this.createUser({ phone, email }, deviceUid, code);
      await this.sendCode(Channels[channel], identifier, code);

      return true;
    }

    if (foundUser.status === UserStatus.Blocked) {
      throw new Error('Аккаунт заблокирован');
    }

    let authToken = await this.authTokensRepository.findOne({
      where: { userId: foundUser.id, deviceUid },
    });

    if (!authToken) {
      authToken = await this.authTokensRepository.create({
        userId: foundUser.id,
        deviceUid,
      });
    }

    if (this.isNotAllowAction(authToken)) {
      throw new Error('Повторный запрос кода авторизации возможен раз в 3 мин');
    }

    await this.logoutIfRefreshNotExist(authToken);

    if (
      authToken != null &&
      authToken.deviceUid == deviceUid &&
      authToken.code > 0
    ) {
      await this.sendCode(Channels[channel], identifier, code);

      const authTokenQuery = this.createAuthTokenQuery(
        foundUser.id,
        deviceUid,
        code,
      );

      Object.assign(authToken, { ...authTokenQuery });
      await authToken.save();

      return true;
    }

    await this.sendCode(Channels[channel], identifier, code);

    await this.authByCode(authToken, foundUser.id, deviceUid, code);

    return true;
  }

  async refreshAuthCode(
    { phone, email, channel }: GenerateCodeRequestDto,
    deviceUid: string,
  ): Promise<boolean> {
    const identifier = this.getIdentifierValue({ phone, email });
    const user = await this.usersRepository.findOne({
      where: this.getIdentifierWhere({ phone, email }),
    });

    if (!user) {
      throw new Error(REFRESH_CODE_ERROR_MESSAGE);
    }

    const authToken = await this.authTokensRepository.findOne({
      where: { deviceUid, userId: user.id },
    });

    if (!authToken) {
      throw new Error(REFRESH_CODE_ERROR_MESSAGE);
    }

    if (
      isTimeOver(
        authToken.codeCreatedAt,
        this.authConfig.authCode.authCodeInterval,
      )
    ) {
      throw new Error(
        `повторный запрос смс-кода возможен не чаще одного раза в ${this.authConfig.authCode.authCodeInterval / 60} мин`,
      );
    }

    await this.reserveCodeIssue(identifier, deviceUid, channel, 'refresh_code');

    const code = this.generateCode();

    authToken.code = code;
    authToken.codeCreatedAt = Date.now();
    await authToken.save();

    await this.sendCode(Channels[channel], identifier, code);

    return true;
  }

  async signInCode(
    request: SignInCodeRequestDto,
    deviceUid: string,
  ): Promise<JwtTokens> {
    const user = await this.usersRepository.findOne({
      where: this.getIdentifierWhere(request),
    });

    if (!user) {
      throw new Error(WRONG_CODE_MESSAGE);
    }

    if (user.status === UserStatus.Blocked) {
      throw new Error('Аккаунт заблокирован');
    }

    const activeSession = await this.authTokensRepository.findOne({
      attributes: ['refreshToken'],
      where: { userId: user.id, deviceUid },
    });

    if (
      activeSession?.refreshToken &&
      validateJwt(
        activeSession.refreshToken,
        this.authConfig.jwt.secret,
        this.authConfig.jwt.iss,
        JwtTypes.Refresh,
      )
    ) {
      throw new Error('Вы уже авторизованы на этом устройстве');
    }

    const sequelize = this.authTokensRepository.sequelize!;
    const verification = await sequelize.transaction((transaction) =>
      this.verifySignInCode(user.id, request.code, deviceUid, transaction),
    );

    if ('error' in verification) {
      throw new Error(verification.error);
    }

    const { authToken } = verification;

    const jwtPayload = this.buildJwtPayload(
      user.id,
      user.roleId,
      this.authConfig.jwt.iss,
    );

    const at = generateJwt(
      jwtPayload,
      'access',
      this.authConfig.jwt.secret,
      this.authConfig.jwt.accessExpiresIn,
    );

    const rt = generateJwt(
      jwtPayload,
      'refresh',
      this.authConfig.jwt.secret,
      this.authConfig.jwt.refreshExpiresIn,
    );

    authToken.refreshToken = rt;
    await authToken.save();

    if (user.status === UserStatus.New) {
      user.status = UserStatus.Verified;
      await user.save();
    }

    return {
      access: at,
      refresh: rt,
    };
  }

  async refreshToken(rt: string, deviceUid: string): Promise<JwtTokens> {
    const payload = validateJwt(
      rt,
      this.authConfig.jwt.secret,
      this.authConfig.jwt.iss,
      JwtTypes.Refresh,
    ) as JwtPayload | null;

    if (!payload || isTimeExpired(payload.exp as number)) {
      if (rt.length > 0) {
        await this.logout(deviceUid);
      }

      throw new UnauthorizedException('Доступ запрещен. Требуется авторизация');
    }

    const authToken = await this.authTokensRepository.findOne({
      where: { userId: payload.userId, deviceUid, refreshToken: rt },
    });
    if (!authToken) {
      throw new UnauthorizedException('Доступ запрещен. Требуется авторизация');
    }

    const jwtPayload = this.buildJwtPayload(
      payload.userId,
      payload.roleId,
      this.authConfig.jwt.iss,
    );

    const at = generateJwt(
      jwtPayload,
      'access',
      this.authConfig.jwt.secret,
      this.authConfig.jwt.accessExpiresIn,
    );

    return {
      access: at,
      refresh: rt,
    };
  }

  async logout(deviceUid: string): Promise<boolean> {
    const result = await this.authTokensRepository.update(
      { refreshToken: '', code: 0, attemptCount: 0 },
      { where: { deviceUid, userId: { [Op.ne]: null } } },
    );

    return result[0] > 0;
  }

  private async verifySignInCode(
    userId: number,
    code: number,
    deviceUid: string,
    transaction: Transaction,
  ): Promise<{ authToken: AuthTokens } | { error: string }> {
    const { authCode } = this.authConfig;
    const userKey = `user:${userId}`;

    await lockByKey(
      this.authTokensRepository.sequelize!,
      AdvisoryLockNamespace.SignIn,
      userKey,
      transaction,
    );

    const failures = await this.authCodeEventsService.getRecentSignInFailures(
      userKey,
      authCode.failedSignInWindow,
      authCode.maxFailedSignIns,
      transaction,
    );

    if (failures.length >= authCode.maxFailedSignIns) {
      const unlockAt =
        failures[authCode.maxFailedSignIns - 1].getTime() +
        authCode.failedSignInWindow * 1000;
      const minutes = Math.max(1, Math.ceil((unlockAt - Date.now()) / 60_000));

      return {
        error: `Слишком много неверных попыток ввода кода. Повторите вход через ${minutes} мин.`,
      };
    }

    const [reserved] = await this.authTokensRepository.update(
      { attemptCount: literal('"attempt_count" + 1') },
      {
        where: {
          userId,
          deviceUid,
          attemptCount: { [Op.lt]: authCode.maxNumberCodeAttempts },
        },
        transaction,
      },
    );

    if (reserved === 0) {
      const hasCodeRequest = await this.authTokensRepository.count({
        where: { userId, deviceUid },
        transaction,
      });

      if (hasCodeRequest) {
        return {
          error:
            'Превышен допустимый лимит ошибочных попыток ввода кода авторизации. Повторите запрос кода авторизации.',
        };
      }

      await this.authCodeEventsService.addSignInFailure(
        userKey,
        deviceUid,
        transaction,
      );
      return { error: WRONG_CODE_MESSAGE };
    }

    const authToken = await this.authTokensRepository.findOne({
      where: { userId, code, deviceUid },
      transaction,
    });

    if (!authToken) {
      await this.authCodeEventsService.addSignInFailure(
        userKey,
        deviceUid,
        transaction,
      );
      return { error: WRONG_CODE_MESSAGE };
    }

    if (
      this.receivedAuthCodeExpirationCheck(
        authCode.recievedAuthCodeLifetime,
        authToken.codeCreatedAt,
      )
    ) {
      return { error: 'ошибка авторизации: время действия кода истекло' };
    }

    await authToken.update({ code: 0, attemptCount: 0 }, { transaction });

    return { authToken };
  }

  private async reserveCodeIssue(
    identifier: string,
    deviceUid: string,
    channel: string,
    eventType: 'generate_code' | 'refresh_code',
  ): Promise<void> {
    const { maxCodesPerIdentifier, codesPerIdentifierWindow } =
      this.authConfig.authCode;

    const reserved = await this.authCodeEventsService.reserveCodeIssue(
      {
        phone: identifier,
        deviceUid,
        notifyType: channel,
        eventType,
        status: AuthLogPending.Pending,
      },
      maxCodesPerIdentifier,
      codesPerIdentifierWindow,
    );

    if (!reserved) {
      throw new Error(
        `Превышен лимит запросов кода авторизации: не более ${maxCodesPerIdentifier} в ${codesPerIdentifierWindow / 60} мин. Повторите позже.`,
      );
    }
  }

  private generateCode(): number {
    return Math.floor(Math.random() * 9000) + 1000;
  }

  private async isPossibilityResend(
    identifier: string,
    channel: string,
    deviceUid: string,
  ): Promise<boolean> {
    const now = Date.now();

    const result = await this.authCodeEventsService.getLastItemByNotifyType(
      identifier,
      channel,
      deviceUid,
    );

    if (!result) {
      return true;
    }

    return now - result.createdAt > 60000; // 60000 мс
  }

  private isNotAllowAction(authToken: AuthTokens): boolean {
    const now = Date.now();
    const expiryTime = now - authToken.codeCreatedAt;

    if (180 * 1000 > expiryTime) {
      return true;
    }

    if (!authToken.refreshToken) {
      return false;
    }

    return false;
  }

  private async logoutIfRefreshNotExist(authToken: AuthTokens): Promise<void> {
    if (authToken.refreshToken.length === 0) {
      return;
    }

    const payload = validateJwt(
      authToken.refreshToken,
      this.authConfig.jwt.secret,
      this.authConfig.jwt.iss,
      JwtTypes.Refresh,
    );

    if (!payload) {
      await this.logout(authToken.deviceUid);
    }
  }

  private async authByCode(
    authToken: AuthTokens | null,
    userId: number,
    deviceUid: string,
    code: number,
  ) {
    const authTokenQuery = this.createAuthTokenQuery(userId, deviceUid, code);

    if (!authToken) {
      const orphanToken = await this.authTokensRepository.findOne({
        where: { userId: null, deviceUid },
      });

      if (orphanToken) {
        Object.assign(orphanToken, { ...authTokenQuery });
        await orphanToken.save();
      } else {
        await this.authTokensRepository.create(authTokenQuery);
      }
    } else {
      Object.assign(authToken, { ...authTokenQuery });
      await authToken.save();
    }
  }

  private createAuthTokenQuery(
    userId: number,
    deviceUid: string,
    code: number,
  ): Partial<AuthTokens> {
    const authTokenQuery: Partial<AuthTokens> = {
      userId,
      deviceUid,
      code,
      codeCreatedAt: Date.now(),
      attemptCount: 0,
    };

    return authTokenQuery;
  }

  protected async sendCode(
    channel: Channels,
    identifier: string,
    code: number,
  ) {
    const result = await this.notificationsService.send(
      channel,
      identifier,
      code.toString(),
    );
    if (!result) {
      throw new Error('Ошибка при отправке кода авторизации');
    }
  }

  protected async createUser(
    identifier: { phone?: string; email?: string },
    deviceUid: string,
    code: number,
  ): Promise<boolean> {
    const role = await this.rolesRepository.findOne({
      where: { code: UserRoles.User },
    });

    const sequelize = this.usersRepository.sequelize!;
    const user = await sequelize.transaction(async (transaction) => {
      const created = await this.usersRepository.create(
        {
          roleId: role?.id,
          phone: identifier.phone,
          email: identifier.email,
          status: UserStatus.New,
        },
        { transaction },
      );

      created.personalId = this.generatePersonalId(
        created.id,
        created.createdAt as Date,
      );
      await created.save({ transaction });

      return created;
    });
    if (!user) {
      throw new InternalServerErrorException(
        'Ошибка при авторизации пользователя',
      );
    }

    const authTokenQuery = this.createAuthTokenQuery(user.id, deviceUid, code);

    const authToken = await this.authTokensRepository.findOne({
      where: { deviceUid },
    });

    if (authToken) {
      Object.assign(authToken, { ...authTokenQuery });
      await authToken.save();

      return true;
    }

    const newAuthToken = await this.authTokensRepository.create(authTokenQuery);
    if (!newAuthToken) {
      throw new InternalServerErrorException(
        'Ошибка при авторизации пользователя',
      );
    }

    return true;
  }

  private generatePersonalId(userId: number, createdAt: Date): string {
    const createdAtSeconds = Math.floor(createdAt.getTime() / 1000);
    const salt = randomBytes(32).toString('hex');

    return createHash('sha256')
      .update(`${userId}:${createdAtSeconds}:${salt}`)
      .digest('hex');
  }

  private buildJwtPayload(
    userId: number,
    roleId: number,
    iss: string,
  ): JwtPayload {
    return {
      userId,
      roleId,
      iss,
    };
  }

  private receivedAuthCodeExpirationCheck(
    codeLifetime: number,
    codeCreatedAt: number,
  ) {
    const now = Date.now();
    return now - codeCreatedAt > codeLifetime * 1000;
  }

  private getIdentifierWhere({
    phone,
    email,
  }: {
    phone?: string;
    email?: string;
  }) {
    if (phone) return { phone };
    if (email) return whereEmailIgnoreCase(email);

    throw new Error('Не указан телефон или email');
  }

  private getIdentifierValue({
    phone,
    email,
  }: {
    phone?: string;
    email?: string;
  }): string {
    if (phone) return phone;
    if (email) return email;

    throw new Error('Не указан телефон или email');
  }

  async checkEmailAvailability(email: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: whereEmailIgnoreCase(email),
    });
    return !user;
  }

  async suggestNickname(name: string): Promise<string> {
    const NICKNAME_MAX_LENGTH = 50;

    const slug = slugConverter(name, { locale: 'ru', lower: true })
      .replace(/[^a-z0-9]/g, '')
      .slice(0, NICKNAME_MAX_LENGTH - 2);
    const base = slug.length >= 3 ? slug : 'user';

    let candidate = base;
    let suffix = 0;

    while (
      (await this.usersRepository.findOne({
        attributes: ['id'],
        where: { nickname: candidate },
      })) ||
      (await this.authorsRepository.findOne({
        attributes: ['id'],
        where: { nickname: candidate },
      }))
    ) {
      suffix += 1;
      candidate = `${base}${suffix}`;
    }

    return candidate;
  }
}
