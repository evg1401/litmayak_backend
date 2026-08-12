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
import { AuthTokens, Users } from '@models';
import { Channels } from '@/notifications/dto/notifications.dto';
import { NotificationsService } from '@/notifications/notifications.service';
import { InjectModel } from '@nestjs/sequelize';
import { Roles } from 'libs/models/roles.model';
import { UserRoles } from '@/common/constants/roles.constants';
import { generateJwt, JwtTypes, validateJwt } from 'configs/jwt.config';
import type { AuthOpts, JwtTokens } from 'configs/jwt.config';
import { Op } from 'sequelize';
import { JwtPayload } from 'jsonwebtoken';
import { AuthLogPending } from './dto/auth_code_events.dto';
import { isTimeExpired, isTimeOver } from '@/helpers';

@Injectable()
export class AuthService {
  constructor(
    protected authCodeEventsService: AuthCodeEventsService,
    protected notificationsService: NotificationsService,
    @InjectModel(Users) protected usersRepository: typeof Users,
    @InjectModel(AuthTokens) protected authTokensRepository: typeof AuthTokens,
    @InjectModel(Roles) protected rolesRepository: typeof Roles,
    @Inject('AUTH_CONFIG') private authConfig: AuthOpts,
  ) {}

  async generateAuthCode(
    { phone, channel }: GenerateCodeRequestDto,
    deviceUid: string,
  ): Promise<number> {
    const code = this.generateCode();

    if (!(await this.isPossibilityResend(phone, channel, deviceUid))) {
      throw new Error(
        'Повторный запрос кода авторизации доступен раз в 60 сек для каждого способа получения',
      );
    }

    await this.authCodeEventsService.AddAuthLog({
      phone,
      deviceUid,
      notifyType: channel,
      eventType: 'generate_code',
      status: AuthLogPending.Pending,
    });

    const foundUser = await this.usersRepository.findOne({ where: { phone } });
    if (!foundUser) {
      await this.createUser(phone, deviceUid, code);
      await this.sendCode(Channels[channel], phone, code);
      return code;
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

    // const authToken = await this.authTokensRepository.findOne({
    //   where: { userId: foundUser.id, deviceUid },
    // });

    if (
      authToken != null &&
      authToken.deviceUid == deviceUid &&
      authToken.code > 0
    ) {
      await this.sendCode(Channels[channel], phone, code);

      const authTokenQuery = this.createAuthTokenQuery(
        foundUser.id,
        deviceUid,
        code,
      );

      Object.assign(authToken, { ...authTokenQuery });
      await authToken.save();

      return code;
    }

    await this.sendCode(Channels[channel], phone, code);

    await this.authByCode(authToken, foundUser.id, deviceUid, code);

    return code;
  }

  async refreshAuthCode(
    { phone, channel }: GenerateCodeRequestDto,
    deviceUid: string,
  ): Promise<number> {
    const authToken = await this.authTokensRepository.findOne({
      where: { deviceUid },
    });

    if (!authToken) {
      throw new Error('ошибка обновления кода: запросите код заново');
    }

    const user = await this.usersRepository.findOne({
      where: { id: authToken.userId },
    });

    if (!user) {
      throw new Error('ошибка обновления кода: запросите код заново');
    } else if (user.phone !== phone) {
      throw new Error('номер телефона не совпадает с запрошенным ранее');
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

    const code = this.generateCode();

    authToken.code = code;
    authToken.codeCreatedAt = Date.now();
    await authToken.save();

    await this.sendCode(Channels[channel], phone, code);

    return code;
  }

  async signInCode(
    request: SignInCodeRequestDto,
    deviceUid: string,
  ): Promise<JwtTokens> {
    const user = await this.usersRepository.findOne({
      where: { phone: request.phone },
      // include: ['role'],
    });

    if (!user) {
      throw new Error('Введен неверный номер телефона');
    }

    const userCurrentAuthToken = await this.authTokensRepository.findOne({
      where: { userId: user.id, deviceUid },
    });

    if (!userCurrentAuthToken) {
      throw new Error('У Вас нет зарегистрированных запросов кода авторизации');
    }

    if (
      userCurrentAuthToken.attemptCount >=
      this.authConfig.authCode.maxNumberCodeAttempts
    ) {
      throw new Error(
        'Превышен допустимый лимит ошибочных попыток ввода кода авторизации. Повторите запрос кода авторизации.',
      );
    }

    const authToken = await this.authTokensRepository.findOne({
      where: { userId: user.id, code: request.code, deviceUid },
    });

    if (!authToken) {
      userCurrentAuthToken.attemptCount = userCurrentAuthToken.attemptCount + 1;
      await userCurrentAuthToken.save();

      throw new Error('Введен неверный код авторизации');
    }

    const isCodeExpired = this.receivedAuthCodeExpirationCheck(
      this.authConfig.authCode.recievedAuthCodeLifetime,
      authToken.codeCreatedAt,
    );

    if (isCodeExpired) {
      throw new Error('ошибка авторизации: время действия кода истекло');
    }

    if (authToken.deviceUid !== deviceUid) {
      throw new InternalServerErrorException(
        'Запрос проверочного кода произведен с другого устройства. Повторите запрос кода авторизации.',
      );
    }

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
    authToken.attemptCount = 0;
    authToken.code = 0;
    await authToken.save();

    if (!user.status) {
      user.status = true;
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
      payload.id,
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

  private generateCode(): number {
    return Math.floor(Math.random() * 9000) + 1000;
  }

  private async isPossibilityResend(
    phone: string,
    channel: string,
    deviceUid: string,
  ): Promise<boolean> {
    const now = Date.now();

    const result = await this.authCodeEventsService.getLastItemByNotifyType(
      phone,
      channel,
      deviceUid,
    );

    if (!result) {
      return true;
    }

    return now - result.createdAt > 60000; // 60000 мс
  }

  private isNotAllowAction(authToken: AuthTokens): boolean {
    // let authToken = await this.authTokensRepository.findOne({
    //   where: { userId, deviceUid },
    // });

    // if (!authToken) {
    //   authToken = await this.authTokensRepository.create({ userId, deviceUid });
    //   // throw new InternalServerErrorException(
    //   //   'Ошибка при авторизации пользователя',
    //   // );
    // }

    // const expiryTime = new Date(authToken.updatedAt.getTime() + 180 * 1000);
    // if (new Date() < expiryTime) {
    //   return true;
    // }

    const now = Date.now();
    const expiryTime = now - authToken.codeCreatedAt;

    if (180 * 1000 > expiryTime) {
      return true;
    }

    if (!authToken.refreshToken) {
      return false;
    }

    // const payload = validateJwt(
    //   authToken.refreshToken,
    //   this.authConfig.jwt.secret,
    //   JwtTypes.Refresh,
    // );
    // if (!payload) {
    //   if (authToken.refreshToken.length > 0) {
    //     await this.logout(authToken.deviceUid);
    //   }
    // }

    return false;
  }

  private async logoutIfRefreshNotExist(authToken: AuthTokens): Promise<void> {
    if (authToken.refreshToken.length === 0) {
      return;
    }

    const payload = validateJwt(
      authToken.refreshToken,
      this.authConfig.jwt.secret,
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
        // orphanToken.userId = userId;
        // orphanToken.code = code;
        // orphanToken.codeCreatedAt = Date.now();
        Object.assign(orphanToken, { ...authTokenQuery });
        await orphanToken.save();
      } else {
        // const authTokenQuery = this.createAuthTokenQuery(
        //   userId,
        //   deviceUid,
        //   code,
        // );

        await this.authTokensRepository.create(authTokenQuery);
      }
    } else {
      // authToken.code = code;
      // authToken.codeCreatedAt = Date.now();
      Object.assign(authToken, { ...authTokenQuery });
      await authToken.save();
      // if (
      //   authToken.refreshToken === '' &&
      //   (authToken.deviceUid === '' || authToken.deviceUid === deviceUid)
      // ) {
      //   // Object.assign(authToken, { ...authTokenQuery });
      //   await authToken.save();
      // } else {
      //   await this.authTokensRepository.create(authTokenQuery);
      // }
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

  protected async sendCode(channel: Channels, phone: string, code: number) {
    const result = await this.notificationsService.send(
      channel,
      phone,
      code.toString(),
    );
    if (!result) {
      throw new Error('Ошибка при отправке кода авторизации');
    }
  }

  protected async createUser(
    phone: string,
    deviceUid: string,
    code: number,
  ): Promise<boolean> {
    const role = await this.rolesRepository.findOne({
      where: { code: UserRoles.User },
    });

    const user = await this.usersRepository.create({
      roleId: role?.id,
      phone,
      status: false,
    });
    if (!user) {
      throw new InternalServerErrorException(
        'Ошибка при авторизации пользователя',
      );
    }

    // const createAuthTokenQuery = {
    //   userId: result.id,
    //   deviceUid,
    //   code,
    // }

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
    return now - codeCreatedAt > codeLifetime * 1000; // перевод codeLifetime из сек в мс
  }
}
