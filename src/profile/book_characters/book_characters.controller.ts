import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookCharactersService } from '@/profile/book_characters/book_characters.service';
import { UserLocals } from '@/decorators';
import { httpExeptHandler } from '@/helpers';
import type { IUserLocals } from 'libs/interfaces';
import {
  CreateBookCharactersRequestDto,
  UpdateBookCharactersRequestDto,
} from './dto/book_characters.request.dto';
import { ResponseDto } from 'dto/response.dto';
import { BookCharacters } from '@models';

@ApiTags('Главы')
@Controller('profile/books/characters')
export class BookCharactersController {
  constructor(private readonly bookCharactersService: BookCharactersService) {}

  @ApiOperation({ summary: 'создать главу' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  async createCharacter(
    @Body()
    request: CreateBookCharactersRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<number>> {
    try {
      const result = await this.bookCharactersService.createCharacter(
        userId,
        request,
      );

      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: e.message });
      }

      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'редактировать главу' })
  @Patch(':id')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  async updateCharacter(
    @Param('id') id: string,
    @Body()
    request: UpdateBookCharactersRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<number>> {
    try {
      const result = await this.bookCharactersService.updateCharacter(
        parseInt(id, 10),
        userId,
        request,
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
