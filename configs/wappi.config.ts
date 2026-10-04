import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getEnv } from './helpers';

export interface WappiOpts {
  baseUrl: string;
  token: string;
  tgProfileId: string;
}

export const wappiConfigProvider: Provider<WappiOpts> = {
  provide: 'WAPPI_CONFIG',
  useFactory: (configService: ConfigService) => ({
    baseUrl: getEnv('WAPPI_BASE_URL', configService),
    token: getEnv('WAPPI_TOKEN', configService),
    tgProfileId: getEnv('WAPPI_TG_PROFILE_ID', configService),
  }),
  inject: [ConfigService],
};
