import { getErrorMessage, httpExeptHandler } from '@/helpers';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'dto/response.dto';
import type { IUserLocals } from 'libs/interfaces';
import { UserLocals } from '@/decorators';
import { BookmarksService, BookmarkView } from './bookmarks.service';
import { UpsertBookmarkRequestDto } from './dto/bookmarks.request.dto';

@ApiTags('Закладки')
@Controller('profile/bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @ApiOperation({ summary: 'список закладок (для ЛК)' })
  @Get()
  async getList(
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<BookmarkView[]>> {
    try {
      const result = await this.bookmarksService.getList(userId);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'закладка в конкретной книге, если есть' })
  @Get(':bookId')
  async getOne(
    @Param('bookId', ParseIntPipe) bookId: number,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<BookmarkView | null>> {
    try {
      const result = await this.bookmarksService.getOne(userId, bookId);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'сохранить/перенести закладку' })
  @Post()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: false, whitelist: true }))
  async upsert(
    @Body() request: UpsertBookmarkRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<BookmarkView>> {
    try {
      const result = await this.bookmarksService.upsert(
        userId,
        request.bookId,
        request.chapterId,
      );
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'убрать закладку' })
  @Delete(':bookId')
  async remove(
    @Param('bookId', ParseIntPipe) bookId: number,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<number>> {
    try {
      const result = await this.bookmarksService.remove(userId, bookId);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }
}
