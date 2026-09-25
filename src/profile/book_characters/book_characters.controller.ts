import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BookCharacters } from '@models';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname } from 'node:path';
import { BookCharactersService } from '@/profile/book_characters/book_characters.service';
import { CheckAbilities, UserLocals } from '@/decorators';
import { httpExeptHandler } from '@/helpers';
import type { IUserLocals } from 'libs/interfaces';
import {
  CreateBookCharactersRequestDto,
  UpdateBookCharactersRequestDto,
} from './dto/book_characters.request.dto';
import { ResponseDto } from 'dto/response.dto';
import { AbilitiesGuard } from '@/guards/abilities.guard';
import { Actions, Subjects } from '@/common/constants/abilities.constants';
import { AppLogger } from '@/logger/logger.service';
import { DOC_MAX_SIZE_BYTES } from 'configs/documents.config';
import {
  SUPPORT_DOC_EXT,
  SUPPORT_DOC_MIME_TYPES,
} from 'libs/common/book_document_converters';

const documentExtension = (
  file: Pick<Express.Multer.File, 'originalname'>,
): string => extname(file.originalname).toLowerCase();

const isSupportedDocument = (
  file: Pick<Express.Multer.File, 'originalname' | 'mimetype'>,
): boolean =>
  SUPPORT_DOC_EXT.includes(documentExtension(file)) &&
  SUPPORT_DOC_MIME_TYPES.includes(file.mimetype);

@ApiTags('Главы')
@Controller('profile/books/characters')
@UseGuards(AbilitiesGuard)
export class BookCharactersController {
  constructor(
    private readonly bookCharactersService: BookCharactersService,
    private readonly logger: AppLogger,
  ) {}

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
  @CheckAbilities({ action: Actions.Create, subject: Subjects.BookCharacters })
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

  @ApiOperation({ summary: 'загрузить главу' })
  @Get(':id')
  @CheckAbilities({ action: Actions.Read, subject: Subjects.BookCharacters })
  async getCharacter(
    @Param('id') idStr: string,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<BookCharacters>> {
    try {
      const id = parseInt(idStr, 10);
      if (Number.isNaN(id)) {
        throw new Error('Произошла ошибка при обработке запроса');
      }

      const result = await this.bookCharactersService.getCharacter(id, userId);

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
    }),
  )
  @CheckAbilities({ action: Actions.Update, subject: Subjects.BookCharacters })
  async updateCharacter(
    @Param('id') idStr: string,
    @Body()
    request: UpdateBookCharactersRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<number>> {
    try {
      const id = parseInt(idStr, 10);
      if (Number.isNaN(id)) {
        throw new Error('Произошла ошибка при обработке запроса');
      }

      const result = await this.bookCharactersService.updateCharacter(
        id,
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

  @ApiOperation({ summary: 'загрузить текст главы из документа' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'документ с текстом главы',
        },
      },
    },
  })
  @Put(':id/content')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: tmpdir(),
        filename: (_, file, callback) =>
          callback(null, `${randomUUID()}${documentExtension(file)}`),
      }),
      limits: { fileSize: DOC_MAX_SIZE_BYTES, files: 1 },
      fileFilter: (_, file, callback) =>
        isSupportedDocument(file)
          ? callback(null, true)
          : callback(
              new BadRequestException({
                result: null,
                message: `ожидается документ форматов: ${SUPPORT_DOC_EXT.join(', ')}`,
              }),
              false,
            ),
    }),
  )
  @CheckAbilities({ action: Actions.Update, subject: Subjects.BookCharacters })
  async updateCharacterContent(
    @Param('id') idStr: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<boolean>> {
    try {
      const id = parseInt(idStr, 10);
      if (Number.isNaN(id)) {
        throw new Error('Произошла ошибка при обработке запроса');
      }

      if (!file) {
        throw new Error('документ не был передан');
      }

      const result = await this.bookCharactersService.updateCharacterContent(
        id,
        userId,
        file.path,
      );

      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: false, message: e.message });
      }

      throw httpExeptHandler(e);
    } finally {
      if (file?.path) {
        await unlink(file.path).catch((e: unknown) =>
          this.logger.error(
            `не удалось удалить временный файл ${file.path}`,
            e instanceof Error ? e.stack : String(e),
          ),
        );
      }
    }
  }

  @ApiOperation({ summary: 'удалить главу' })
  @Delete(':id')
  @CheckAbilities({ action: Actions.Delete, subject: Subjects.BookCharacters })
  async deleteCharacter(
    @Param('id') idStr: string,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<number>> {
    try {
      const id = parseInt(idStr, 10);
      if (Number.isNaN(id)) {
        throw new Error('Произошла ошибка при обработке запроса');
      }

      const result = await this.bookCharactersService.deleteCharacter(
        id,
        userId,
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
