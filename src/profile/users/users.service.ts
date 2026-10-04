import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Users, Roles } from '@models';
import { InjectModel } from '@nestjs/sequelize';
import { UpdateUserRequestDto } from './dto/users.request.dto';
import { AppLogger } from '@/logger/logger.service';
import { CrudService } from 'libs/common/crud';
import { UserStatus } from '@/common/constants/user_status.constants';
import { normalizeOwnMediaKey, whereEmailIgnoreCase } from '@/helpers';

const UPDATABLE_PROFILE_FIELDS = [
  'fullname',
  'email',
  'nickname',
  'avatar',
  'additionalFields',
] as const satisfies readonly (keyof UpdateUserRequestDto)[];

@Injectable()
export class UsersService extends CrudService<Users> {
  constructor(
    private readonly logger: AppLogger,
    @InjectModel(Users)
    protected model: typeof Users,
  ) {
    super();
  }

  async getProfile(userId: number): Promise<Users | null> {
    return this.getByid(userId, {
      attributes: [
        'fullname',
        'phone',
        'status',
        'email',
        'nickname',
        'avatar',
        'additionalFields',
        'createdAt',
      ],
      include: [{ model: Roles, attributes: ['code'] }],
    });
  }

  async updateProfile(
    userId: number,
    request: UpdateUserRequestDto,
  ): Promise<number> {
    if (request.nickname) {
      const existing = await this.model.findOne({
        attributes: ['id'],
        where: { nickname: request.nickname },
      });

      if (existing && existing.id !== userId) {
        throw new Error('Никнэйм уже занят. Придумайте другой.');
      }
    }

    if (request.email) {
      const existing = await this.model.findOne({
        attributes: ['id'],
        where: whereEmailIgnoreCase(request.email),
      });

      if (existing && existing.id !== userId) {
        throw new Error('Email уже используется другим пользователем');
      }
    }

    if (request.avatar) {
      request.avatar = await normalizeOwnMediaKey(userId, request.avatar);
    }

    const result = await this.update(
      { ...request },
      { where: { id: userId }, fields: [...UPDATABLE_PROFILE_FIELDS] },
    );

    if (request.nickname) {
      await this.model.update(
        { status: UserStatus.Active },
        { where: { id: userId, status: UserStatus.Verified } },
      );
    }

    return result[0];
  }

  async checkNicknameAvailability(
    userId: number,
    nickname: string,
  ): Promise<boolean> {
    const existing = await this.model.findOne({
      attributes: ['id'],
      where: { nickname },
    });

    return !existing || existing.id === userId;
  }

  async getRoleId(userId: number): Promise<number | null> {
    const user = await this.model.findByPk(userId, { attributes: ['roleId'] });

    return user?.roleId ?? null;
  }

  async updateRoleByUserId(userId: number, roleId: number): Promise<number> {
    try {
      const user = await this.update({ roleId }, { where: { id: userId } });

      return user[0];
    } catch (e) {
      this.logger.warn(
        `не удалось обновить роль (roleId: ${roleId}) для id пользователя: ${userId}`,
        e,
      );

      throw new InternalServerErrorException(
        'внутренняя ошибка при регистрации пользователя в качестве автора',
      );
    }
  }
}
