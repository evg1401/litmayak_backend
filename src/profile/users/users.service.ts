import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Users } from '@models';
import { InjectModel } from '@nestjs/sequelize';
import { UpdateUserRequestDto } from './dto/users.request.dto';
import { AppLogger } from '@/logger/logger.service';
import { CrudService } from 'libs/common/crud';

@Injectable()
export class UsersService extends CrudService<Users> {
  constructor(
    private readonly logger: AppLogger,
    @InjectModel(Users)
    protected model: typeof Users,
  ) {
    super();
  }

  async updateUser(userId: number, request: UpdateUserRequestDto): Promise<number> {
    const result = await this.update(
      { ...request },
      { where: { id: userId } },
    );

    return result[0];
  }

  async updateRoleByUserId(userId: number, roleId: number): Promise<number> {
    try {
      const user = await this.update(
        { roleId },
        { where: { id: userId } },
      );

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
