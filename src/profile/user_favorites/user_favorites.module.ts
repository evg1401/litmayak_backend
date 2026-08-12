import { UserFavoriteBooks } from '@models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserFavoriteBooksService } from '@/profile/user_favorites/user_favorite_books.service';

@Module({
  imports: [SequelizeModule.forFeature([UserFavoriteBooks])],
  controllers: [],
  providers: [UserFavoriteBooksService],
})
export class UserFavoriteModule {}
