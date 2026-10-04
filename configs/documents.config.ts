import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModuleAsyncOptions } from '@nestjs/platform-express';
import { getIntEnv } from './helpers';

export interface DocumentsOpts {
  maxSizeBytes: number;
}

const getMaxSizeBytes = (configService: ConfigService): number =>
  getIntEnv('DOC_CHARACTER_MAX_SIZE_MB', configService) * 1024 * 1024;

export const documentsConfigProvider: Provider<DocumentsOpts> = {
  provide: 'DOCUMENTS_CONFIG',
  useFactory: (configService: ConfigService) => ({
    maxSizeBytes: getMaxSizeBytes(configService),
  }),
  inject: [ConfigService],
};

export const documentsMulterOptions: MulterModuleAsyncOptions = {
  useFactory: (configService: ConfigService) => ({
    limits: { fileSize: getMaxSizeBytes(configService), files: 1 },
  }),
  inject: [ConfigService],
};
