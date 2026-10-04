import { getErrorMessage, httpExeptHandler } from '@/helpers';
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'dto/response.dto';
import {
  MagazineArticleDetailView,
  MagazineArticleSummaryView,
  MagazineService,
} from './magazine.service';

@ApiTags('Журнал')
@Controller('magazine')
export class MagazineController {
  constructor(private readonly magazineService: MagazineService) {}

  @ApiOperation({ summary: 'список опубликованных статей журнала' })
  @Get('articles')
  async getList(
    @Query('category') category?: string,
  ): Promise<ResponseDto<MagazineArticleSummaryView[]>> {
    try {
      const result = await this.magazineService.getList('journal', category);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'статья журнала по slug' })
  @Get('articles/:slug')
  async getOne(
    @Param('slug') slug: string,
  ): Promise<ResponseDto<MagazineArticleDetailView>> {
    try {
      const result = await this.magazineService.getBySlug('journal', slug);
      if (!result) {
        throw new NotFoundException({ result: null, message: 'статья не найдена' });
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
