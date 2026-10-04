import { NotificationSettings } from '@models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { NotificationSettingsController } from './notification_settings.controller';
import { NotificationSettingsService } from './notification_settings.service';

@Module({
  imports: [SequelizeModule.forFeature([NotificationSettings])],
  controllers: [NotificationSettingsController],
  providers: [NotificationSettingsService],
})
export class NotificationSettingsModule {}
