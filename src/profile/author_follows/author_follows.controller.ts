import { getErrorMessage, httpExeptHandler } from '@/helpers';
import { UserLocals } from '@/decorators';
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
import { AuthorFollowsService } from './author_follows.service';
import { FollowAuthorRequestDto } from './dto/author_follows.request.dto';
import { PublicAuthorInfo } from '@/authors/authors.service';

@ApiTags('Авторы')
@Controller('profile/authors')
export class AuthorFollowsController {
  constructor(private readonly authorFollowsService: AuthorFollowsService) {}

  @ApiOperation({ summary: 'подписаться на автора' })
  @Post('follow')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async follow(
    @Body() request: FollowAuthorRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<boolean>> {
    try {
      await this.authorFollowsService.follow(userId, request.authorId);
      return { result: true };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'отписаться от автора' })
  @Post('unfollow')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async unfollow(
    @Body() request: FollowAuthorRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<boolean>> {
    try {
      await this.authorFollowsService.unfollow(userId, request.authorId);
      return { result: true };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({
    summary: 'id авторов, на которых подписан текущий пользователь',
  })
  @Get('follow')
  async getFollowed(
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<number[]>> {
    try {
      const result = await this.authorFollowsService.getFollowedAuthorIds(
        userId,
      );
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({
    summary: 'подписки текущего пользователя целиком - для "Мои авторы"',
  })
  @Get('follow/details')
  async getFollowedDetails(
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<PublicAuthorInfo[]>> {
    try {
      const result = await this.authorFollowsService.getFollowedAuthorsInfo(
        userId,
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
