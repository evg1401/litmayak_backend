import { getErrorMessage, httpExeptHandler } from '@/helpers';
import { Books } from '@models';
import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'dto/response.dto';
import { BookTopRatingService } from './book_top_rating.service';
import { TopRatingQueryDto } from './dto/book_top_rating.request.dto';

@ApiTags('Книги')
@Controller('book-top-rating')
export class BookTopRatingController {
  constructor(private readonly bookTopRatingService: BookTopRatingService) {}

  @ApiOperation({ summary: 'топ-10 книг сайта - для витрины главной' })
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getTop(
    @Query() query: TopRatingQueryDto,
  ): Promise<ResponseDto<Books[]>> {
    try {
      const result = await this.bookTopRatingService.getTop(query.limit ?? 10);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }
}
