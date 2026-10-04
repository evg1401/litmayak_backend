import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getEnv } from './helpers';

export interface S3Opts {
  region: string;
  bucket: string;
  hostSuffix: string;
  accessKey: string;
  secretKey: string;
}

export const getS3Opts = (configService: ConfigService): S3Opts => ({
  region: getEnv('S3_REGION', configService),
  bucket: getEnv('S3_BUCKET', configService),
  hostSuffix: getEnv('S3_HOST_SUFFIX', configService),
  accessKey: getEnv('S3_ACCESS_KEY', configService),
  secretKey: getEnv('S3_SECRET_KEY', configService),
});

export const s3ConfigProvider: Provider<S3Opts> = {
  provide: 'S3_CONFIG',
  useFactory: getS3Opts,
  inject: [ConfigService],
};
