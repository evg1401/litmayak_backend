import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UpdateUserRequestDto } from './dto/users.request.dto';
import { httpExeptHandler } from '@/helpers';
import { ResponseDto } from 'dto/response.dto';
import type { IUserLocals } from 'libs/interfaces';
import { UserLocals } from '@/decorators';
import { Users } from '@models';

@ApiTags('Пользователи')
@Controller('profile/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'профиль пользователя' })
  @Get()
  async getProfile(
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<Users>> {
    try {
      const result = await this.usersService.getProfile(userId);
      if (!result) {
        throw new NotFoundException({
          result: null,
          message: 'профиль пользователя не найден',
        });
      }

      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: e.message });
      }

      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'обновить профиль' })
  @Patch()
  @UsePipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  async update(
    @Body()
    request: UpdateUserRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<number>> {
    let err: any = null;
    try {
      const result = await this.usersService.update(
        { ...request },
        { where: { id: userId } },
      );

      return { result: result[0] };
    } catch (e) {
      if (e instanceof Error) {
        err = e.message;
        throw new BadRequestException({ result: null, message: e.message });
      }

      err = JSON.stringify(e);
      throw httpExeptHandler(e);
    }
  }
}
