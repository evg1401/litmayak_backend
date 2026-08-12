import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PublishingHouses } from '@models';
import { PublishingHousesController } from '@/publishing_houses/publishing_houses.controller';
import { PublishingHousesService } from './publishing_houses.service';

@Module({
  imports: [SequelizeModule.forFeature([PublishingHouses])],
  controllers: [PublishingHousesController],
  providers: [PublishingHousesService],
})
export class PublishingHousesModule {}
