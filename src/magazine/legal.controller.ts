import { getErrorMessage, httpExeptHandler } from '@/helpers';
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'dto/response.dto';
import {
  MagazineArticleDetailView,
  MagazineArticleSummaryView,
  MagazineService,
} from './magazine.service';

@ApiTags('Правовая информация')
@Controller('legal')
export class LegalController {
  constructor(private readonly magazineService: MagazineService) {}

  @ApiOperation({ summary: 'список опубликованных документов правовой информации' })
  @Get('articles')
  async getList(): Promise<ResponseDto<MagazineArticleSummaryView[]>> {
    try {
      const result = await this.magazineService.getList('legal');
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'документ правовой информации по slug' })
  @Get('articles/:slug')
  async getOne(
    @Param('slug') slug: string,
  ): Promise<ResponseDto<MagazineArticleDetailView>> {
    try {
      const result = await this.magazineService.getBySlug('legal', slug);
      if (!result) {
        throw new NotFoundException({ result: null, message: 'документ не найден' });
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
