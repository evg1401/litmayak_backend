import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { wappiConfigProvider } from 'configs/wappi.config';
import { unisenderConfigProvider } from 'configs/unisender.config';

@Module({
  imports: [],
  controllers: [],
  providers: [NotificationsService, wappiConfigProvider, unisenderConfigProvider],
  exports: [NotificationsService, 'WAPPI_CONFIG'],
})
export class NotificationsModule {}
