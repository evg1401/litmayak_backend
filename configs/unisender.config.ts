import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getEnv } from './helpers';

export interface UnisenderOpts {
  baseUrl: string;
  token: string;
  senderEmail: string;
  senderName: string;
}

export const unisenderConfigProvider: Provider<UnisenderOpts> = {
  provide: 'UNISENDER_CONFIG',
  useFactory: (configService: ConfigService) => ({
    baseUrl: getEnv('UNISENDER_URL', configService).replace(/\/+$/, ''),
    token: getEnv('UNISENDER_TOKEN', configService),
    senderEmail: getEnv('UNISENDER_SENDER_EMAIL', configService),
    senderName: getEnv('UNISENDER_SENDER_NAME', configService),
  }),
  inject: [ConfigService],
};
