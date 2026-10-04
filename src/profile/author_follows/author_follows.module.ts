import { AuthorFollows, Authors } from '@models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PublicAuthorsModule } from '@/authors/authors.module';
import { AuthorFollowsController } from './author_follows.controller';
import { AuthorFollowsService } from './author_follows.service';

@Module({
  imports: [
    SequelizeModule.forFeature([AuthorFollows, Authors]),
    PublicAuthorsModule,
  ],
  controllers: [AuthorFollowsController],
  providers: [AuthorFollowsService],
})
export class AuthorFollowsModule {}
