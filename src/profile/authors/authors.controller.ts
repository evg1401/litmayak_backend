import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthorsService } from '@/profile/authors/authors.service';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Patch,
  Post,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  CreateAuthorRequestDto,
  UpdateAuthorRequestDto,
} from './dto/authors.request.dto';
import { httpExeptHandler } from '@/helpers';
import { ResponseDto } from 'dto/response.dto';
import type { IUserLocals } from 'libs/interfaces';
import { CheckAbilities, UserLocals } from '@/decorators';
import { Authors } from '@models';
import type { Response } from 'express';
import { AbilitiesGuard } from '@/guards/abilities.guard';
import { Actions, Subjects } from '@/common/constants/abilities.constants';

@ApiTags('Авторы')
@Controller('profile/authors')
@UseGuards(AbilitiesGuard)
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @ApiOperation({ summary: 'профиль автора' })
  @Get()
  @CheckAbilities({ action: Actions.Read, subject: Subjects.Authors })
  async getProfile(
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<Authors>> {
    try {
      const result = await this.authorsService.getProfile(userId);
      if (!result) {
        throw new NotFoundException({
          result: null,
          message: 'профиль автора не найден',
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
  @CheckAbilities({ action: Actions.Update, subject: Subjects.Authors })
  async update(
    @Body()
    request: UpdateAuthorRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<number>> {
    let err: any = null;

    try {
      const result = await this.authorsService.update(userId, request);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        err = e.message;
        throw new BadRequestException({ result: null, message: e.message });
      }

      err = JSON.stringify(e);
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'создать профиль автора' })
  @Post('register')
  @UsePipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  @CheckAbilities({ action: Actions.Create, subject: Subjects.Authors })
  async register(
    @Body()
    request: CreateAuthorRequestDto,
    @UserLocals() { userId }: IUserLocals,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseDto<Authors>> {
    let err: any = null;

    try {
      const result = await this.authorsService.register(userId, request);
      res.status(!result.isNew ? HttpStatus.OK : HttpStatus.CREATED);

      return { result: result.author };
    } catch (e) {
      if (e instanceof Error) {
        err = e.message;
        throw new BadRequestException({ result: null, message: e.message });
      }

      err = JSON.stringify(e);
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'проверка статуса автора' })
  @Get('is-author')
  @CheckAbilities({ action: Actions.Read, subject: Subjects.Authors })
  async isAuthor(
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<boolean>> {
    let err: any = null;

    try {
      const result = await this.authorsService.isAuthor(userId);

      return { result };
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
