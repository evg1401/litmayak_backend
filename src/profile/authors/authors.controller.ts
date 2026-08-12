import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthorsService } from '@/profile/authors/authors.service';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Res,
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
import { UserLocals } from '@/decorators';
import { Authors } from '@models';
import type { Response } from 'express';

@ApiTags('Авторы')
@Controller('profile/authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

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
