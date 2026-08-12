import { httpExeptHandler } from '@/helpers';
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
import { List, PageList, ResponseDto } from 'dto/response.dto';
import { GenresService } from './genres.service';
import { BookGenres } from 'libs/models/book_genres.model';
import { QueryParamsRequestDto } from 'dto/request.dto';
import { BookGenreMeta } from 'libs/models/book_genre_meta.model';
import { GenresMetaService } from '@/genres/genre_meta.service';

@ApiTags('Жанры')
@Controller('genres')
export class GenresController {
  constructor(
    private readonly genresService: GenresService,
    private readonly genresMetaService: GenresMetaService,
  ) {}

  @ApiOperation({ summary: 'список жанров' })
  @Get()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  async getList(): Promise<ResponseDto<List<BookGenres>>> {
    try {
      const items = await this.genresService.getListAll(
        ['name', 'slug', 'order'],
        [],
        [['name', 'ASC']],
      );

      return {
        result: {
          count: items.length,
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

  @ApiOperation({ summary: 'жанр' })
  @Get(':slug')
  async getGenre(
    @Param('slug') slug: string,
  ): Promise<ResponseDto<BookGenres | null>> {
    try {
      const result = await this.genresService.getItem({
        where: { slug },
        attributes: { exclude: ['id'] },
      });

      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: e.message });
      }

      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'список книг жанра' })
  @Get(':slug/books')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  async getGenreBooks(
    @Param('slug') slug: string,
    @Query() query: QueryParamsRequestDto,
  ): Promise<ResponseDto<PageList<BookGenreMeta>>> {
    try {
      const result = await this.genresMetaService.getGenreBooks(
        slug,
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
