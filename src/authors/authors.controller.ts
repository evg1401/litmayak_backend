import { getErrorMessage, httpExeptHandler } from '@/helpers';
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'dto/response.dto';
import {
  AuthorsService,
  PopularAuthorItem,
  PublicAuthorInfo,
  PublicAuthorProfile,
} from './authors.service';
import {
  NewestAuthorsQueryDto,
  PopularAuthorsQueryDto,
} from './dto/authors.request.dto';

@ApiTags('Авторы')
@Controller('authors')
export class PublicAuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @ApiOperation({
    summary: 'популярные авторы (по числу опубликованных книг) - для витрины',
  })
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getPopular(
    @Query() query: PopularAuthorsQueryDto,
  ): Promise<ResponseDto<PopularAuthorItem[]>> {
    try {
      const result = await this.authorsService.getPopularAuthors(
        query.limit ?? 10,
        query.sort ?? 'books',
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
    summary: 'последние зарегистрированные авторы - для витрины "Начинающие"',
  })
  @Get('newest')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getNewest(
    @Query() query: NewestAuthorsQueryDto,
  ): Promise<ResponseDto<PublicAuthorInfo[]>> {
    try {
      const result = await this.authorsService.getNewestAuthors(
        query.limit ?? 10,
      );
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'профиль автора для публичной страницы' })
  @Get(':nickname')
  async getProfile(
    @Param('nickname') nickname: string,
  ): Promise<ResponseDto<PublicAuthorProfile>> {
    try {
      const result = await this.authorsService.getProfile(nickname);
      if (!result) {
        throw new NotFoundException({
          result: null,
          message: 'автор не найден',
        });
      }
      return { result };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }
}
