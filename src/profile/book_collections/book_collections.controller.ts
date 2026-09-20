import { httpExeptHandler } from '@/helpers';
import { CheckAbilities, UserLocals } from '@/decorators';
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
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
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
import { AbilitiesGuard } from '@/guards/abilities.guard';
import { Actions, Subjects } from '@/common/constants/abilities.constants';

@ApiTags('Коллекции')
@Controller('profile/books/collections')
@UseGuards(AbilitiesGuard)
export class BookCollectionsController {
  constructor(
    private readonly bookCollectionMetaService: BookCollectionMetaService,
    private readonly bookCollectionsService: BookCollectionsService,
  ) {}

  @ApiOperation({ summary: 'создать коллекцию' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  @CheckAbilities({ action: Actions.Create, subject: Subjects.BookCollections })
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
  @CheckAbilities({ action: Actions.Read, subject: Subjects.BookCollections })
  async getList(
    @Param('id') idStr: string,
    @Query() query: QueryParamsRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<PageList<BookCollectionsMeta>>> {
    try {
      const id = parseInt(idStr, 10);
      if (Number.isNaN(id)) {
        throw new Error('Произошла ошибка при обработке запроса');
      }

      await this.bookCollectionsService.getUserCollection(userId, id);

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
  @CheckAbilities({ action: Actions.Update, subject: Subjects.BookCollections })
  async updateCollection(
    @Param('id') idStr: string,
    @Body() request: CreateOrUpdateBookCollectionRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<BookCollections>> {
    try {
      const id = parseInt(idStr, 10);
      if (Number.isNaN(id)) {
        throw new Error('Произошла ошибка при обработке запроса');
      }

      const result = await this.bookCollectionsService.updateCollection(
        userId,
        id,
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
  @CheckAbilities({ action: Actions.Create, subject: Subjects.BookCollections })
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
  @CheckAbilities({ action: Actions.Delete, subject: Subjects.BookCollections })
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
