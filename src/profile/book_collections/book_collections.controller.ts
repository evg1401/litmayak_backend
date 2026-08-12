import { httpExeptHandler } from '@/helpers';
import { UserLocals } from '@/decorators';
import {
  BookCollections,
  BookCollectionsMeta,
  BookReviews,
  Books,
} from '@models';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueryParamsRequestDto } from 'dto/request.dto';
import { PageList, ResponseDto } from 'dto/response.dto';
import type { IUserLocals } from 'libs/interfaces';
import {
  AddBookToCollectionRequestDto,
  CreateOrUpdateBookCollectionRequestDto,
  DeleteBatchBooksFromCollectionRequestDto,
} from '@/profile/book_collections/dto/book_collections.request';
import { BookCollectionMetaService } from '@/profile/book_collections/book_collection_meta.service';
import { BookCollectionsService } from '@/profile/book_collections/book_collections.service';

@ApiTags('Коллекции книг')
@Controller('profile/books/collections')
export class BookCollectionsController {
  constructor(
    private readonly bookCollectionMetaService: BookCollectionMetaService,
    private readonly bookCollectionsService: BookCollectionsService,
  ) {}

  @ApiOperation({ summary: 'создать коллекцию' })
  @Post()
  @UsePipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  async createCollection(
    @Body() request: CreateOrUpdateBookCollectionRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<BookCollections>> {
    try {
      const result = await this.bookCollectionsService.createCollection(
        userId,
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

  @ApiOperation({ summary: 'список книг в коллекции' })
  @Get(':id')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  async getList(
    @Param('id') id: string,
    @Query() query: QueryParamsRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<PageList<BookCollectionsMeta>>> {
    try {
      await this.bookCollectionsService.getUserCollection(userId, parseInt(id, 10));

      const include = [
        {
          model: Books,
          attributes: {
            exclude: ['id', 'userId', 'createdAt', 'updatedAt'],
          },
          include: [
            {
              model: BookReviews,
              attributes: {
                exclude: ['id', 'bookId', 'createdAt', 'updatedAt'],
              },
            },
          ],
        },
      ];

      const [total, items] = await Promise.all([
        this.bookCollectionMetaService.countListItems(),
        this.bookCollectionMetaService.getList(
          ...query.buildOrderPaginationParams(),
          include,
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

  @ApiOperation({ summary: 'обновить коллекцию' })
  @Patch(':id')
  @UsePipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  async updateCollection(
    @Param('id') id: string,
    @Body() request: CreateOrUpdateBookCollectionRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<BookCollections>> {
    try {
      const result = await this.bookCollectionsService.updateCollection(
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

  @ApiOperation({ summary: 'добавить книгу в коллекцию' })
  @Post('add')
  @UsePipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  async addBook(
    @Body() request: AddBookToCollectionRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<number>> {
    try {
      const result = await this.bookCollectionMetaService.addBook(
        userId,
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

  @ApiOperation({ summary: 'удалить книги из коллекции' })
  @Post('delete-batch')
  @UsePipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  async deleteBooks(
    @Body() request: DeleteBatchBooksFromCollectionRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<number>> {
    try {
      const result = await this.bookCollectionMetaService.deleteBooks(
        userId,
        request.bookCollectionId,
        request.bookIds,
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
