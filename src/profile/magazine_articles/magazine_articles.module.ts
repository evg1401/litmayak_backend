import { MagazineArticles } from '@models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MagazineArticlesController } from './magazine_articles.controller';
import { MagazineArticlesService } from './magazine_articles.service';

@Module({
  imports: [SequelizeModule.forFeature([MagazineArticles])],
  controllers: [MagazineArticlesController],
  providers: [MagazineArticlesService],
})
export class MagazineArticlesModule {}
