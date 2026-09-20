import { httpExeptHandler } from '@/helpers';
import { Books } from '@models';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'dto/response.dto';
import type { IUserLocals } from 'libs/interfaces';
import { CheckAbilities, UserLocals } from '@/decorators';
import {
  CreateBooksRequestDto,
  UpdateBooksRequestDto,
} from './dto/books.request.dto';
import { ProfileBooksService } from './profile_books.service';
import { Actions, Subjects } from '@/common/constants/abilities.constants';
import { AbilitiesGuard } from '@/guards/abilities.guard';

@ApiTags('Книги')
@Controller('profile/books')
@UseGuards(AbilitiesGuard)
export class ProfileBooksController {
  constructor(private readonly profileBooksService: ProfileBooksService) {}

  @ApiOperation({ summary: 'создать книгу' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  @CheckAbilities({ action: Actions.Create, subject: Subjects.Books })
  async createBook(
    @Body()
    request: CreateBooksRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<Books>> {
    try {
      const result = await this.profileBooksService.create(userId, request);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: e.message });
      }

      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'обновить книгу' })
  @Patch(':id')
  @UsePipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  @CheckAbilities({ action: Actions.Update, subject: Subjects.Books })
  async update(
    @Param('id') idStr: string,
    @Body()
    request: UpdateBooksRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<number>> {
    try {
      const id = parseInt(idStr, 10);
      if (Number.isNaN(id)) {
        throw new Error('Произошла ошибка при обработке запроса');
      }

      const result = await this.profileBooksService.update(userId, id, request);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: e.message });
      }

      throw httpExeptHandler(e);
    }
  }
}
