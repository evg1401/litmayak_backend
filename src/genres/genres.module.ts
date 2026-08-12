import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookGenres } from 'libs/models/book_genres.model';
import { GenresService } from '@/genres/genres.service';
import { GenresController } from '@/genres/genres.controller';
import { BookGenreMeta } from 'libs/models/book_genre_meta.model';
import { Books } from '@models';
import { GenresMetaService } from '@/genres/genre_meta.service';

@Module({
  imports: [SequelizeModule.forFeature([BookGenres, BookGenreMeta, Books])],
  controllers: [GenresController],
  providers: [GenresService, GenresMetaService],
})
export class GenresModule {}
