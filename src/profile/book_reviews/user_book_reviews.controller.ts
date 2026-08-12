import { httpExeptHandler } from '@/helpers';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'dto/response.dto';
import { UserBookReviewsService } from './user_book_reviews.service';
import { CreateUserBookReviewRequestDto } from './dto/user_book_reviews.request';
import { UserLocals } from '@/decorators';
import type { IUserLocals } from 'libs/interfaces';

@ApiTags('Оценка книг')
@Controller('profile/book-reviews')
export class UserBookReviewsController {
  constructor(
    private readonly userBookReviewsService: UserBookReviewsService,
  ) {}

  @ApiOperation({ summary: 'добавить оценку для книги' })
  @Post('add')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  async addReview(
    @Body()
    request: CreateUserBookReviewRequestDto,
     @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<number>> {
    let err: any = null;

    try {
      const result = await this.userBookReviewsService.addReview(userId, request);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        err = e.message;
        throw new BadRequestException({ result: null, message: e.message });
      }

      err = JSON.stringify(e);
      throw httpExeptHandler(e);
    }
  }
}
