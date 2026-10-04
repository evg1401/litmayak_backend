import { getErrorMessage, httpExeptHandler } from '@/helpers';
import {
  Authors,
  BookCharacters,
  BookGenreMeta,
  BookGenres,
  BookReviews,
  Books,
} from '@models';
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PageList, ResponseDto } from 'dto/response.dto';
import {
  BooksService,
  PublicChapterDetail,
  PublicChapterListItem,
} from '@/books/books.service';
import { QueryParamsRequestDto } from 'dto/request.dto';

const bookIncludes = [
  {
    model: Authors,
    attributes: { exclude: ['id', 'userId', 'createdAt', 'updatedAt'] },
  },
  {
    model: BookReviews,
    attributes: { exclude: ['id', 'bookId', 'createdAt', 'updatedAt'] },
  },

  {
    model: BookCharacters,
    separate: true,
    attributes: ['id'],
  },

  {
    model: BookGenreMeta,
    separate: true,
    order: [['order', 'ASC']] as [[string, string]],
    include: [{ model: BookGenres, attributes: ['name', 'slug'] }],
  },
];

@ApiTags('Книги')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @ApiOperation({ summary: 'список книг' })
  @Get()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  async getList(
    @Query() query: QueryParamsRequestDto,
  ): Promise<ResponseDto<PageList<Books>>> {
    try {
      const [total, items] = await Promise.all([
        this.booksService.countPublicListItems(),
        this.booksService.getPublicList(
          ...query.buildOrderPaginationParams(),
          bookIncludes,
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
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }

      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'список книг автора' })
  @Get(':nickname')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  async getAuthorList(
    @Param('nickname') nickname: string,
    @Query() query: QueryParamsRequestDto,
  ): Promise<ResponseDto<PageList<Books>>> {
    try {
      const result = await this.booksService.getAuthorBooks(
        nickname,
        ...query.buildOrderPaginationParams(),
        bookIncludes,
      );

      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }

      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'книга' })
  @Get(':nickname/:slug')
  async getItem(
    @Param('nickname') nickname: string,
    @Param('slug') slug: string,
  ): Promise<ResponseDto<Books | null>> {
    try {
      const result = await this.booksService.getAuthorBook(
        nickname,
        slug,
        bookIncludes,
      );

      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }

      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'главы книги для чтения (только опубликованные)' })
  @Get(':nickname/:slug/chapters')
  async getChapters(
    @Param('nickname') nickname: string,
    @Param('slug') slug: string,
  ): Promise<ResponseDto<PublicChapterListItem[]>> {
    try {
      const result = await this.booksService.getPublicChapters(
        nickname,
        slug,
      );
      if (!result) {
        throw new NotFoundException({ result: null, message: 'книга не найдена' });
      }

      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }

      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'текст опубликованной главы' })
  @Get(':nickname/:slug/chapters/:chapterId')
  async getChapter(
    @Param('nickname') nickname: string,
    @Param('slug') slug: string,
    @Param('chapterId', ParseIntPipe) chapterId: number,
  ): Promise<ResponseDto<PublicChapterDetail>> {
    try {
      const result = await this.booksService.getPublicChapter(
        nickname,
        slug,
        chapterId,
      );
      if (!result) {
        throw new NotFoundException({ result: null, message: 'глава не найдена' });
      }

      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }

      throw httpExeptHandler(e);
    }
  }
}
