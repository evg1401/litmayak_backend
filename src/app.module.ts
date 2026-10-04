import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { getSequelizeConfig } from 'configs/sequelize.config';
import { mediaConfigProvider } from 'configs/media.config';
import { DeviceUidMiddleware } from '@/middlewares/device_uid.middleware';
import { AuthController } from '@/auth/auth.controller';
import { NotificationsModule } from '@/notifications/notifications.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { UsersController } from '@/profile/users/users.controller';
import { UsersModule } from '@/profile/users/users.module';
import { AbilityFactory } from '@/ability/ability.factory';
import { RolesModule } from '@/roles/roles.module';
import { LoggerModule } from '@/logger/logger.module';
import { AuthorsModule } from '@/profile/authors/authors.module';
import { AuthorsController } from '@/profile/authors/authors.controller';
import { AuthorFollowsController } from '@/profile/author_follows/author_follows.controller';
import { PublicAuthorsModule } from '@/authors/authors.module';
import { BookTopRatingModule } from '@/book_top_rating/book_top_rating.module';
import { PublishingHousesController } from '@/publishing_houses/publishing_houses.controller';
import { BooksModule } from '@/books/books.module';
import { UserBookReviewsController } from '@/profile/book_reviews/user_book_reviews.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { ProfileModule } from '@/profile/profile.module';
import { ProfileBooksController } from '@/profile/books/profile_books.controller';
import { UserFavoritesBookController } from '@/profile/user_favorites/book_favorites.controller';
import { SchedulersModule } from '@/schedulers/schedulers.module';
import { BookCollectionsController } from '@/profile/book_collections/book_collections.controller';
import { GenresModule } from '@/genres/genres.module';
import { BookCharactersController } from './profile/book_characters/book_characters.controller';
import { PostsModule } from '@/posts/posts.module';
import { ProfilePostsModule } from '@/profile/posts/profile_posts.module';
import { ProfilePostsController } from '@/profile/posts/profile_posts.controller';
import { NotificationSettingsModule } from '@/profile/notification_settings/notification_settings.module';
import { NotificationSettingsController } from '@/profile/notification_settings/notification_settings.controller';
import { ReadingSettingsModule } from '@/profile/reading_settings/reading_settings.module';
import { ReadingSettingsController } from '@/profile/reading_settings/reading_settings.controller';
import { BookmarksModule } from '@/profile/bookmarks/bookmarks.module';
import { BookmarksController } from '@/profile/bookmarks/bookmarks.controller';
import { AuthorVerificationsModule } from '@/profile/author_verifications/author_verifications.module';
import { AuthorVerificationsController } from '@/profile/author_verifications/author_verifications.controller';
import { NewsletterModule } from '@/newsletter/newsletter.module';
import { MagazineModule } from '@/magazine/magazine.module';
import { MagazineArticlesModule } from '@/profile/magazine_articles/magazine_articles.module';
import { MagazineArticlesController } from '@/profile/magazine_articles/magazine_articles.controller';
import { UploadsModule } from '@/profile/uploads/uploads.module';
import { UploadsController } from '@/profile/uploads/uploads.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `envs/.env`,
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 10 }],
      errorMessage: (_, { timeToBlockExpire }) =>
        `слишком много запросов. Повторите попытку через ${timeToBlockExpire} сек.`,
    }),

    SequelizeModule.forRootAsync(getSequelizeConfig),

    LoggerModule,
    SchedulersModule,
    AuthModule,
    NotificationsModule,
    RolesModule,
    UsersModule,
    AuthorsModule,
    PublicAuthorsModule,
    BookTopRatingModule,
    BooksModule,
    ProfileModule,
    GenresModule,
    PostsModule,
    ProfilePostsModule,
    NotificationSettingsModule,
    ReadingSettingsModule,
    BookmarksModule,
    AuthorVerificationsModule,
    NewsletterModule,
    MagazineModule,
    MagazineArticlesModule,
    UploadsModule,

    ScheduleModule.forRoot(),
  ],
  providers: [AbilityFactory, mediaConfigProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DeviceUidMiddleware).forRoutes(AuthController);
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        UsersController,
        AuthorsController,
        AuthorFollowsController,
        PublishingHousesController,
        ProfileBooksController,
        UserFavoritesBookController,
        UserBookReviewsController,
        BookCollectionsController,
        BookCharactersController,
        ProfilePostsController,
        NotificationSettingsController,
        ReadingSettingsController,
        BookmarksController,
        AuthorVerificationsController,
        MagazineArticlesController,
        UploadsController,
      );
  }
}
