import { Authors, Books, PublishingHouses, UserFavoriteBooks } from '@models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProfileBooksController } from '@/profile/books/profile_books.controller';
import { ProfileBooksService } from './profile_books.service';
import { UserFavoriteBooksService } from '@/profile/user_favorites/user_favorite_books.service';
import { BookCollectionsModule } from '../book_collections/book_collections.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Books,
      Authors,
      PublishingHouses,
      UserFavoriteBooks,
    ]),
  ],

  controllers: [ProfileBooksController],
  providers: [ProfileBooksService, UserFavoriteBooksService],
})
export class ProfileBooksModule {}
