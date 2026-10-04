import { getErrorMessage, httpExeptHandler } from '@/helpers';
import { Books } from '@models';
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
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname } from 'node:path';
import { PageList, ResponseDto } from 'dto/response.dto';
import type { IUserLocals } from 'libs/interfaces';
import { CheckAbilities, UserLocals } from '@/decorators';
import {
  CreateBooksRequestDto,
  UpdateBooksRequestDto,
} from './dto/books.request.dto';
import {
  ProfileBooksService,
  OwnBookDetail,
  OwnBookView,
} from './profile_books.service';
import {
  EpubImportService,
  EpubImportResult,
  EpubMetadataPreview,
} from './epub_import.service';
import { Actions, Subjects } from '@/common/constants/abilities.constants';
import { AbilitiesGuard } from '@/guards/abilities.guard';
import { QueryParamsRequestDto } from 'dto/request.dto';

const EPUB_EXT = '.epub';
const EPUB_MIME_TYPES = ['application/epub+zip'];

function epubFileInterceptor() {
  return FileInterceptor('file', {
    storage: diskStorage({
      destination: tmpdir(),
      filename: (_, file, callback) =>
        callback(null, `${randomUUID()}${extname(file.originalname)}`),
    }),
    fileFilter: (_, file, callback) => {
      const ext = extname(file.originalname).toLowerCase();
      const isEpub =
        ext === EPUB_EXT ||
        EPUB_MIME_TYPES.includes(file.mimetype.toLowerCase());
      isEpub
        ? callback(null, true)
        : callback(
            new BadRequestException({
              result: null,
              message: 'ожидается файл формата .epub',
            }),
            false,
          );
    },
  });
}

@ApiTags('Книги')
@Controller('profile/books')
@UseGuards(AbilitiesGuard)
export class ProfileBooksController {
  constructor(
    private readonly profileBooksService: ProfileBooksService,
    private readonly epubImportService: EpubImportService,
  ) {}

  @ApiOperation({ summary: 'мои книги (автор)' })
  @Get()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  @CheckAbilities({ action: Actions.Read, subject: Subjects.Books })
  async getOwn(
    @Query() query: QueryParamsRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<PageList<OwnBookView>>> {
    try {
      const result = await this.profileBooksService.getOwnBooks(
        userId,
        query.page,
        query.limit,
      );
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'моя книга' })
  @Get(':id')
  @CheckAbilities({ action: Actions.Read, subject: Subjects.Books })
  async getOne(
    @Param('id') idStr: string,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<OwnBookDetail>> {
    try {
      const id = parseInt(idStr, 10);
      if (Number.isNaN(id)) {
        throw new Error('Произошла ошибка при обработке запроса');
      }

      const result = await this.profileBooksService.getOwnBook(userId, id);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'создать книгу' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
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
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
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
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }

      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({
    summary: 'импортировать книгу из epub (метаданные + главы)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'файл .epub' },
      },
    },
  })
  @Post(':id/import-epub')
  @UseInterceptors(epubFileInterceptor())
  @CheckAbilities({ action: Actions.Update, subject: Subjects.Books })
  async importEpub(
    @Param('id') idStr: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<EpubImportResult>> {
    try {
      const id = parseInt(idStr, 10);
      if (Number.isNaN(id)) {
        throw new Error('Произошла ошибка при обработке запроса');
      }
      if (!file) {
        throw new Error('файл не был передан');
      }

      const result = await this.epubImportService.importEpub(
        userId,
        id,
        file.path,
      );
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    } finally {
      if (file?.path) {
        await unlink(file.path).catch(() => {});
      }
    }
  }

  @ApiOperation({
    summary: 'предпросмотр метаданных epub (без сохранения, книги ещё нет)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'файл .epub' },
      },
    },
  })
  @Post('parse-epub')
  @UseInterceptors(epubFileInterceptor())
  @CheckAbilities({ action: Actions.Create, subject: Subjects.Books })
  async parseEpub(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<ResponseDto<EpubMetadataPreview>> {
    try {
      if (!file) {
        throw new Error('файл не был передан');
      }

      const result = await this.epubImportService.parseMetadataOnly(
        file.path,
      );
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    } finally {
      if (file?.path) {
        await unlink(file.path).catch(() => {});
      }
    }
  }

  @ApiOperation({ summary: 'удалить книгу' })
  @Delete(':id')
  @CheckAbilities({ action: Actions.Delete, subject: Subjects.Books })
  async deleteOne(
    @Param('id') idStr: string,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<boolean>> {
    try {
      const id = parseInt(idStr, 10);
      if (Number.isNaN(id)) {
        throw new Error('Произошла ошибка при обработке запроса');
      }

      await this.profileBooksService.deleteOwnBook(userId, id);
      return { result: true };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }
}
