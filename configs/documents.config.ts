import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MulterModuleAsyncOptions,
  MulterModuleOptions,
} from '@nestjs/platform-express';

export interface DocumentsOpts {
  maxSizeBytes: number;
  bookMaxSizeBytes: number;
}

// проверяет макс. размер файлов
const toMaxSizeBytes = (name: string, maxSizeMb: string | undefined): number => {
  const sizeMb = Number(maxSizeMb);

  if (!maxSizeMb || !Number.isInteger(sizeMb) || sizeMb <= 0) {
    throw new Error(`переменная окружения ${name} не задана: ожидается целое число mb`);
  }

  return sizeMb * 1024 * 1024;
};

export const documentsConfigProvider: Provider<DocumentsOpts> = {
  provide: 'DOCUMENTS_CONFIG',
  useFactory: (configService: ConfigService) => ({
    maxSizeBytes: toMaxSizeBytes('DOC_CHARACTER_MAX_SIZE_MB', configService.get('DOC_CHARACTER_MAX_SIZE_MB')),
    bookMaxSizeBytes: toMaxSizeBytes('DOC_BOOK_MAX_SIZE_MB', configService.get('DOC_BOOK_MAX_SIZE_MB')),
  }),
  inject: [ConfigService],
};

const docMulterOpt = (envName: string): MulterModuleAsyncOptions => ({
  useFactory: (configService: ConfigService): MulterModuleOptions => ({
    limits: {
      fileSize: toMaxSizeBytes(envName, configService.get(envName)),
      files: 1,
    },
  }),
  inject: [ConfigService],
});

// документ главы
export const characterDocumentMulterOptions = docMulterOpt('DOC_CHARACTER_MAX_SIZE_MB');

// документ книги
export const bookDocumentMulterOptions = docMulterOpt('DOC_BOOK_MAX_SIZE_MB');
