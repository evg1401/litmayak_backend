import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthCodeEvents, AuthTokens, Users, Roles } from '@models';
import { AuthCodeEventsService } from './auth_code_events.service';
import { NotificationsModule } from '@/notifications/notifications.module';
import { ConfigModule } from '@nestjs/config';
import { authConfigProvider } from 'configs/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `envs/.env`,
    }),
    SequelizeModule.forFeature([AuthCodeEvents, Users, AuthTokens, Roles]),
    NotificationsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthCodeEventsService, authConfigProvider],
  exports: ['AUTH_CONFIG'],
})
export class AuthModule {}
