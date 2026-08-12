import { httpExeptHandler } from '@/helpers';
import { Books, UserFavoriteBooks } from '@models';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
  CreateBooksRequestDto,
  UpdateBooksRequestDto,
} from './dto/books.request.dto';
import {
  AddBookFavoritesRequestDto,
  DeleteBatchBookFavoritesRequestDto,
} from './dto/book_favorites.request';
import { ProfileBooksService } from './profile_books.service';
import { QueryParamsRequestDto } from 'dto/request.dto';
import { UserFavoriteBooksService } from '@/profile/user_favorites/user_favorite_books.service';

@ApiTags('Книги')
@Controller('profile/books')
export class ProfileBooksController {
  constructor(
    private readonly profileBooksService: ProfileBooksService,
    private readonly userFavoriteBooksService: UserFavoriteBooksService,
  ) {}

  @ApiOperation({ summary: 'создать книгу' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  async createBook(
    @Body()
    request: CreateBooksRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<Books>> {
    try {
      const result = await this.profileBooksService.create(userId, request);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: e.message });
      }

      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'обновить книгу' })
  @Patch(':id')
  @UsePipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  async update(
    @Param('id') id: string,
    @Body()
    request: UpdateBooksRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<number>> {
    try {
      const result = await this.profileBooksService.update(
        userId,
        parseInt(id, 10),
        request,
      );
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: e.message });
      }

      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'добавить книгу в избранное' })
  @Post('favorites/add')
  async addToFavorite(
    @Body()
    request: AddBookFavoritesRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<number>> {
    try {
      const result = await this.profileBooksService.addToFavorite(
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
  @Post('favorites/delete-batch')
  async deleteFromFavorite(
    @Body()
    request: DeleteBatchBookFavoritesRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<number>> {
    try {
      const result = await this.profileBooksService.deleteFromFavorite(
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
  @Get('favorites')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  async getList(
    @Query() query: QueryParamsRequestDto,
  ): Promise<ResponseDto<PageList<UserFavoriteBooks>>> {
    try {
      const [total, items] = await Promise.all([
        this.userFavoriteBooksService.countListItems(),
        this.userFavoriteBooksService.getList(
          ...query.buildOrderPaginationParams(),
        ),
      ]);

      return {
        result: {
          count: items.length,
          total,
          items,
        },
      };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: e.message });
      }

      throw httpExeptHandler(e);
    }
  }
}
