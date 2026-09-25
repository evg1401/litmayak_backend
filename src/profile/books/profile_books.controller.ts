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
import {
  SUPPORT_BOOK_EXT,
  SUPPORT_BOOK_MIME_TYPES,
} from 'libs/common/book_document_converters';
import { ResponseDto } from 'dto/response.dto';
import type { IUserLocals } from 'libs/interfaces';
import { CheckAbilities, UserLocals } from '@/decorators';
import {
  CreateBookFromFileRequestDto,
  CreateBooksRequestDto,
  UpdateBooksRequestDto,
} from './dto/books.request.dto';
import { ProfileBooksService } from './profile_books.service';
import { Actions, Subjects } from '@/common/constants/abilities.constants';
import { AbilitiesGuard } from '@/guards/abilities.guard';
import { AppLogger } from '@/logger/logger.service';

const documentExtension = (
  file: Pick<Express.Multer.File, 'originalname'>,
): string => extname(file.originalname).toLowerCase();

const isSupportedBookDocument = (
  file: Pick<Express.Multer.File, 'originalname' | 'mimetype'>,
): boolean =>
  SUPPORT_BOOK_EXT.includes(documentExtension(file)) &&
  SUPPORT_BOOK_MIME_TYPES.includes(file.mimetype);

@ApiTags('Книги')
@Controller('profile/books')
@UseGuards(AbilitiesGuard)
export class ProfileBooksController {
  constructor(
    private readonly profileBooksService: ProfileBooksService,
    private readonly logger: AppLogger,
  ) {}

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

  @ApiOperation({ summary: 'загрузить книгу из файла' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'документ книги',
        },
        publishingHouseId: {
          type: 'integer',
          description: 'id издательского дома',
        },
      },
    },
  })
  @Post('content')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: tmpdir(),
        filename: (_, file, callback) =>
          callback(null, `${randomUUID()}${documentExtension(file)}`),
      }),
      fileFilter: (_, file, callback) =>
        isSupportedBookDocument(file)
          ? callback(null, true)
          : callback(
              new BadRequestException({
                result: null,
                message: `ожидается документ форматов: ${SUPPORT_BOOK_EXT.join(', ')}`,
              }),
              false,
            ),
    }),
  )
  @CheckAbilities({ action: Actions.Create, subject: Subjects.Books })
  async createBookFromFile(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() request: CreateBookFromFileRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<Books>> {
    try {
      if (!file) {
        throw new Error('книга не была загружена');
      }

      const result = await this.profileBooksService.createFromFile(
        userId,
        file.path,
        request,
      );
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: e.message });
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
}
