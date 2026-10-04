import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  AuthorPostComments,
  AuthorPostLikes,
  AuthorPostReposts,
  AuthorPosts,
  Authors,
} from '@models';
import { PostsController } from './posts.controller';
import { LatestPostsController } from './latest_posts.controller';
import { PostsService } from './posts.service';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      AuthorPosts,
      AuthorPostLikes,
      AuthorPostReposts,
      AuthorPostComments,
      Authors,
    ]),
    AuthModule,
  ],
  controllers: [PostsController, LatestPostsController],
  providers: [PostsService],
})
export class PostsModule {}
