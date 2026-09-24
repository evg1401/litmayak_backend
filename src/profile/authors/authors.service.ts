import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Authors } from '@models';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateAuthorRequestDto,
  UpdateAuthorRequestDto,
} from './dto/authors.request.dto';
import { RolesService } from '@/roles/roles.service';
import { UserRoles } from '@/common/constants/roles.constants';
import { AppLogger } from '@/logger/logger.service';
import { UsersService } from '@/profile/users/users.service';

@Injectable()
export class AuthorsService {
  constructor(
    protected rolesService: RolesService,
    protected usersService: UsersService,
    private readonly logger: AppLogger,
    @InjectModel(Authors) protected authorsRepository: typeof Authors,
  ) {}

  async update(
    userId: number,
    request: UpdateAuthorRequestDto,
  ): Promise<number> {
    if (request.nickname) {
      const existingAuthor = await this.authorsRepository.findOne({
        attributes: ['userId'],
        where: { nickname: request.nickname },
      });

      if (existingAuthor && existingAuthor.userId !== userId)
        throw new Error('Никнэйм уже занят. Придумайте другой.');
    }

    const result = await this.authorsRepository.update(
      { ...request },
      { where: { userId } },
    );

    return result[0];
  }

  async register(
    userId: number,
    request: CreateAuthorRequestDto,
  ): Promise<{ author: Authors; isNew: boolean }> {
    const existingAuthor = await this.authorsRepository.findOne({
      where: { userId },
    });
    if (existingAuthor) return { author: existingAuthor, isNew: false };

    const author = await this.createAuthorProfile(userId, request);
    await this.assignAuthorRole(userId);

    return { author, isNew: true };
  }

  async isAuthor(userId: number): Promise<boolean> {
    const existingAuthor = await this.authorsRepository.findOne({
      where: { userId },
    });

    return !!existingAuthor;
  }

  async getProfile(userId: number): Promise<Authors | null> {
    return this.authorsRepository.findOne({
      where: { userId },
      attributes: [
        'nickname',
        'showOnlyNickname',
        'images',
        'email',
        'phone',
        'status',
        'createdAt',
      ],
    });
  }

  async getAuthorProfileByUserId(userId: number): Promise<Authors | null> {
    const existingAuthor = await this.authorsRepository.findOne({
      where: { userId },
    });

    return existingAuthor;
  }

  private async createAuthorProfile(
    userId: number,
    request: CreateAuthorRequestDto,
  ): Promise<Authors> {
    try {
      const existingAuthor = await this.authorsRepository.findOne({
        where: { nickname: request.nickname },
      });

      if (existingAuthor) {
        throw new Error('Никнэйм уже занят. Придумайте другой.');
      }

      const result = await this.authorsRepository.create({
        ...request,
        userId,
      });

      if (!result) {
        throw new Error('ошибка при создании профиля автора');
      }

      return result;
    } catch (error) {
      this.logger.error(
        `не удалось создать профиль автора для id пользователя: ${userId}`,
        error,
      );
      throw new InternalServerErrorException(
        'внутренняя ошибка при регистрации пользователя в качестве автора',
      );
    }
  }

  private async assignAuthorRole(userId: number): Promise<void> {
    const role = await this.rolesService.getRoleByCode(UserRoles.Author);
    if (!role) {
      this.logger.error(
        `роль не была загружена по параметру: ${UserRoles.Author}`,
      );
      throw new InternalServerErrorException(
        'внутренняя ошибка при регистрации пользователя в качестве автора',
      );
    }

    await this.usersService.updateRoleByUserId(userId, role.id);
  }
}
