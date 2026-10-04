import { getErrorMessage, httpExeptHandler } from '@/helpers';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'dto/response.dto';
import type { IUserLocals } from 'libs/interfaces';
import { MagazineArticles } from '@models';
import { CheckAbilities, UserLocals } from '@/decorators';
import { Actions, Subjects } from '@/common/constants/abilities.constants';
import { AbilitiesGuard } from '@/guards/abilities.guard';
import { MagazineArticlesService } from './magazine_articles.service';
import { SaveMagazineArticleRequestDto } from './dto/magazine_articles.request.dto';

@ApiTags('Статьи журнала/правовой информации (админ)')
@Controller('profile/magazine-articles')
@UseGuards(AbilitiesGuard)
export class MagazineArticlesController {
  constructor(
    private readonly magazineArticlesService: MagazineArticlesService,
  ) {}

  @ApiOperation({ summary: 'список статей (включая черновики)' })
  @Get()
  @CheckAbilities({ action: Actions.Read, subject: Subjects.MagazineArticles })
  async getList(
    @Query('section') section?: 'journal' | 'legal',
  ): Promise<ResponseDto<MagazineArticles[]>> {
    try {
      const result = await this.magazineArticlesService.getList(section);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'создать статью' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @CheckAbilities({
    action: Actions.Create,
    subject: Subjects.MagazineArticles,
  })
  async create(
    @Body() request: SaveMagazineArticleRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<MagazineArticles>> {
    try {
      const result = await this.magazineArticlesService.create(
        userId,
        request,
      );
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'изменить статью' })
  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @CheckAbilities({
    action: Actions.Update,
    subject: Subjects.MagazineArticles,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: SaveMagazineArticleRequestDto,
  ): Promise<ResponseDto<MagazineArticles>> {
    try {
      const result = await this.magazineArticlesService.update(id, request);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'удалить статью' })
  @Delete(':id')
  @CheckAbilities({
    action: Actions.Delete,
    subject: Subjects.MagazineArticles,
  })
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<number>> {
    try {
      const result = await this.magazineArticlesService.delete(id);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }
}
