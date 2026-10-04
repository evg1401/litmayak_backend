import { Module } from '@nestjs/common';
import { s3ConfigProvider } from 'configs/s3.config';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, s3ConfigProvider],
})
export class UploadsModule {}
