import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface DocumentsOpts {
  maxSizeBytes: number;
}

const DOC_MAX_SIZE_DEFAULT_MB = 10;

const toMaxSizeBytes = (maxSizeMb: string | undefined): number =>
  parseInt(maxSizeMb ?? `${DOC_MAX_SIZE_DEFAULT_MB}`, 10) * 1024 * 1024;

export const documentsConfigProvider: Provider<DocumentsOpts> = {
  provide: 'DOCUMENTS_CONFIG',
  useFactory: (configService: ConfigService) => ({
    maxSizeBytes: toMaxSizeBytes(configService.get('DOC_CHARACTER_MAX_SIZE_MB')),
  }),
  inject: [ConfigService],
};

export const DOC_MAX_SIZE_BYTES = toMaxSizeBytes(process.env.DOC_CHARACTER_MAX_SIZE_MB);
