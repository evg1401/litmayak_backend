import { httpExeptHandler } from '@/helpers';
import { UserFavoriteBooks } from '@models';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PageList, ResponseDto } from 'dto/response.dto';
import type { IUserLocals } from 'libs/interfaces';
import { UserLocals } from '@/decorators';
import {
  AddBookFavoritesRequestDto,
  DeleteBatchBookFavoritesRequestDto,
} from '@/profile/books/dto/book_favorites.request';
import { QueryParamsRequestDto } from 'dto/request.dto';
import { UserFavoriteBooksService } from '@/profile/user_favorites/user_favorite_books.service';

@ApiTags('Книги')
@Controller('profile/books/favorites')
export class UserFavoritesBookController {
  constructor(
    private readonly userFavoriteBooksService: UserFavoriteBooksService,
  ) {}

  @ApiOperation({ summary: 'добавить книгу в избранное' })
  @Post('add')
  async addToFavorite(
    @Body()
    request: AddBookFavoritesRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<number>> {
    try {
      const result = await this.userFavoriteBooksService.addToFavorite(
        userId,
        request.bookId,
      );

      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: e.message });
      }

      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'удалить книги из избранного' })
  @Post('delete-batch')
  async deleteFromFavorite(
    @Body()
    request: DeleteBatchBookFavoritesRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<number>> {
    try {
      const result = await this.userFavoriteBooksService.deleteFromFavorite(
        userId,
        request.ids,
      );

      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: e.message });
      }

      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'список избранного' })
  @Get()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  async getList(
    @Query() query: QueryParamsRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<PageList<UserFavoriteBooks>>> {
    try {
      const result = await this.userFavoriteBooksService.getUserFavorites(
        userId,
        ...query.buildOrderPaginationParams(),
      );

      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: e.message });
      }

      throw httpExeptHandler(e);
    }
  }
}
