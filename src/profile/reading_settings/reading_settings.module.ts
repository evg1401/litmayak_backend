import { ReadingSettings } from '@models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReadingSettingsController } from './reading_settings.controller';
import { ReadingSettingsService } from './reading_settings.service';

@Module({
  imports: [SequelizeModule.forFeature([ReadingSettings])],
  controllers: [ReadingSettingsController],
  providers: [ReadingSettingsService],
})
export class ReadingSettingsModule {}
