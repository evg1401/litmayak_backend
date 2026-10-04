import { Authors, AuthorVerifications } from '@models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthorVerificationsController } from './author_verifications.controller';
import { AuthorVerificationsService } from './author_verifications.service';

@Module({
  imports: [SequelizeModule.forFeature([Authors, AuthorVerifications])],
  controllers: [AuthorVerificationsController],
  providers: [AuthorVerificationsService],
})
export class AuthorVerificationsModule {}
