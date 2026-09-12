import { Authors, Books, PublishingHouses } from '@models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProfileBooksController } from '@/profile/books/profile_books.controller';
import { ProfileBooksService } from './profile_books.service';
import { UserFavoriteModule } from '@/profile/user_favorites/user_favorites.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Books, Authors, PublishingHouses]),
    UserFavoriteModule,
  ],
  controllers: [ProfileBooksController],
  providers: [ProfileBooksService],
})
export class ProfileBooksModule {}
