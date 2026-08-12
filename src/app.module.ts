import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { getSequelizeConfig } from 'configs/sequelize.config';
import { DeviceUidMiddleware } from '@/middlewares/device_uid.middleware';
import { AuthController } from '@/auth/auth.controller';
import { NotificationsModule } from '@/notifications/notifications.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { UsersController } from '@/profile/users/users.controller';
import { AbilityFactory } from '@/ability/ability.factory';
import { authConfigProvider } from 'configs/jwt.config';
import { RolesModule } from '@/roles/roles.module';
import { LoggerModule } from '@/logger/logger.module';
import { AuthorsModule } from '@/profile/authors/authors.module';
import { AuthorsController } from '@/profile/authors/authors.controller';
import { PublishingHousesController } from '@/publishing_houses/publishing_houses.controller';
import { BooksModule } from '@/books/books.module';
import { UserBookReviewsController } from '@/profile/book_reviews/user_book_reviews.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { ProfileModule } from '@/profile/profile.module';
import { ProfileBooksController } from '@/profile/books/profile_books.controller';
import { SchedulersModule } from '@/schedulers/schedulers.module';
import { BookCollectionsController } from '@/profile/book_collections/book_collections.controller';
import { GenresModule } from '@/genres/genres.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `envs/.env`,
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60, limit: 10 }],
    }),

    SequelizeModule.forRootAsync(getSequelizeConfig),

    LoggerModule,
    SchedulersModule,
    AuthModule,
    NotificationsModule,
    RolesModule,
    AuthorsModule,
    BooksModule,
    ProfileModule,
    GenresModule,

    ScheduleModule.forRoot(),
  ],
  providers: [AbilityFactory, authConfigProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DeviceUidMiddleware).forRoutes(AuthController);
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        UsersController,
        AuthorsController,
        PublishingHousesController,
        ProfileBooksController,
        UserBookReviewsController,
        BookCollectionsController,
      );
  }
}
