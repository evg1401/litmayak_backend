import { httpExeptHandler } from '@/helpers';
import { Authors, BookReviews, Books } from '@models';
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PageList, ResponseDto } from 'dto/response.dto';
import { BooksService } from '@/books/books.service';
import { QueryParamsRequestDto } from 'dto/request.dto';

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
      skipNullProperties: true,
    }),
  )
  async getList(
    @Query() query: QueryParamsRequestDto,
  ): Promise<ResponseDto<PageList<Books>>> {
    try {
      const [total, items] = await Promise.all([
        this.booksService.countListItems(),
        this.booksService.getList(...query.buildOrderPaginationParams(), [
          {
            model: Authors,
            attributes: { exclude: ['id', 'userId', 'createdAt', 'updatedAt'] },
          },
          {
            model: BookReviews,
            attributes: { exclude: ['id', 'bookId', 'createdAt', 'updatedAt'] },
          },
        ]),
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

  @ApiOperation({ summary: 'книга' })
  @Get(':slug')
  async getItem(
    @Param('slug') slug: string,
  ): Promise<ResponseDto<Books | null>> {
    try {
      const result = await this.booksService.getItem({ where: { slug } });

      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: e.message });
      }

      throw httpExeptHandler(e);
    }
  }
}
