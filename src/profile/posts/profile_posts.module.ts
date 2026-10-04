import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  AuthorPostComments,
  AuthorPostImages,
  AuthorPostLikes,
  AuthorPostReposts,
  AuthorPosts,
  Authors,
  BookCharacters,
  Books,
} from '@models';
import { ProfilePostsController } from './profile_posts.controller';
import { ProfilePostsService } from './profile_posts.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      AuthorPosts,
      AuthorPostImages,
      AuthorPostLikes,
      AuthorPostReposts,
      AuthorPostComments,
      Authors,
      Books,
      BookCharacters,
    ]),
  ],
  controllers: [ProfilePostsController],
  providers: [ProfilePostsService],
})
export class ProfilePostsModule {}
