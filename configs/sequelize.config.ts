import { ConfigService } from '@nestjs/config';
import { SequelizeModuleAsyncOptions } from '@nestjs/sequelize';
import {
  AuthTokens,
  Permissions,
  RolePermissions,
  Users,
  Authors,
  PublishingHouses,
  Books,
  AuthCodeEvents,
  AuthorRewardPercents,
  BookCharacters,
  UserBookReviews,
  UserBookPurchase,
  UserFavoriteBooks,
  BookReviews,
  CheckLogs,
  UserBookCharacters,
  Roles,
} from 'libs/models/index';

export const getSequelizeConfig: SequelizeModuleAsyncOptions = {
  useFactory: (configService: ConfigService) => ({
    dialect: 'postgres',
    logging: false,
    benchmark: true,
    host: configService.get('DB_HOST'),
    port: parseInt(configService.get('DB_PORT') as string),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASS'),
    database: configService.get('DB_NAME'),
    autoLoadModels: true,
    synchronize: configService.get('ENV') === 'test',
    define: {
      underscored: true,
    },
    sync: {
      alter: true,
    },

    models: [
      Users,
      Permissions,
      RolePermissions,
      AuthTokens,
      AuthCodeEvents,
      Authors,
      AuthorRewardPercents,
      PublishingHouses,
      Books,
      BookCharacters,
      UserBookReviews,
      UserBookPurchase,
      UserFavoriteBooks,
      BookReviews,
      CheckLogs,
      UserBookCharacters,
      Roles,
    ],
  }),
  inject: [ConfigService],
  // imports: [ConfigModule],
};
