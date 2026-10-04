import { MagazineArticles } from '@models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MagazineController } from './magazine.controller';
import { LegalController } from './legal.controller';
import { MagazineService } from './magazine.service';

@Module({
  imports: [SequelizeModule.forFeature([MagazineArticles])],
  controllers: [MagazineController, LegalController],
  providers: [MagazineService],
})
export class MagazineModule {}
