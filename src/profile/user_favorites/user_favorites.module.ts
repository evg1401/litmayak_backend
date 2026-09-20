import { Books, UserFavoriteBooks } from '@models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserFavoriteBooksService } from '@/profile/user_favorites/user_favorite_books.service';
import { UserFavoritesBookController } from '@/profile/user_favorites/book_favorites.controller';

@Module({
  imports: [SequelizeModule.forFeature([UserFavoriteBooks, Books])],
  controllers: [UserFavoritesBookController],
  providers: [UserFavoriteBooksService],
  exports: [UserFavoriteBooksService],
})
export class UserFavoriteModule {}
