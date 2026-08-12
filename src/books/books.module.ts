import { Authors, Books, PublishingHouses, UserFavoriteBooks } from '@models';
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
    ]),
  ],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
