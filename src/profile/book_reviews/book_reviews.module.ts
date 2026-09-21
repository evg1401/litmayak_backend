import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookReviews, UserBookReviews } from '@models';
import { BookReviewsService } from '@/profile/book_reviews/book_reviews.service';
import { UserBookReviewsService } from '@/profile/book_reviews/user_book_reviews.service';
import { UserBookReviewsController } from './user_book_reviews.controller';

@Module({
  imports: [SequelizeModule.forFeature([BookReviews, UserBookReviews])],
  controllers: [UserBookReviewsController],
  providers: [BookReviewsService, UserBookReviewsService],
  exports: [BookReviewsService, UserBookReviewsService],
})
export class BookReviewsModule {}
