import {
  Authors,
  BookCharacters,
  Books,
  PublishingHouses,
  UserFavoriteBooks,
} from '@models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BooksController } from '@/books/books.controller';
import { BooksService } from '@/books/books.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Books,
      Authors,
      PublishingHouses,
      UserFavoriteBooks,
      BookCharacters,
    ]),
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
