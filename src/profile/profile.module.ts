import { UsersModule } from '@/profile/users/users.module';
import { Module } from '@nestjs/common';
import { AuthorsModule } from './authors/authors.module';
import { PublishingHousesModule } from '@/publishing_houses/publishing_houses.module';
import { ProfileBooksModule } from './books/profile_books.module';
import { BookReviewsModule } from './book_reviews/book_reviews.module';
import { BookCollectionsModule } from '@/profile/book_collections/book_collections.module';
import { BookCharactersModule } from '@/profile/book_characters/book_characters.module';
import { UserFavoriteModule } from '@/profile/user_favorites/user_favorites.module';

@Module({
  imports: [
    UsersModule,
    AuthorsModule,
    PublishingHousesModule,
    ProfileBooksModule,
    BookReviewsModule,
    BookCollectionsModule,
    BookCharactersModule,
    UserFavoriteModule,
  ],
  controllers: [],
  providers: [],
})
export class ProfileModule {}
