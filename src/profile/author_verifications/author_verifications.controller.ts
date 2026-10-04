import { getErrorMessage, httpExeptHandler } from '@/helpers';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'dto/response.dto';
import type { IUserLocals } from 'libs/interfaces';
import { UserLocals } from '@/decorators';
import {
  AuthorVerificationsService,
  AuthorVerificationView,
} from './author_verifications.service';
import { SubmitAuthorVerificationRequestDto } from './dto/author_verifications.request.dto';

@ApiTags('Верификация автора')
@Controller('profile/author-verifications')
export class AuthorVerificationsController {
  constructor(
    private readonly authorVerificationsService: AuthorVerificationsService,
  ) {}

  @ApiOperation({ summary: 'статус верификации и последняя отправленная форма' })
  @Get()
  async getStatus(
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<AuthorVerificationView>> {
    try {
      const result = await this.authorVerificationsService.getStatus(userId);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'отправить форму верификации на проверку' })
  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async submit(
    @Body() request: SubmitAuthorVerificationRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<AuthorVerificationView>> {
    try {
      const result = await this.authorVerificationsService.submit(
        userId,
        request,
      );
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }
}
