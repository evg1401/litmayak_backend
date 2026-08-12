import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookReviews, UserBookReviews } from '@models';
import { BookReviewsService } from '@/profile/book_reviews/book_reviews.service';
import { UserBookReviewsService } from '@/profile/book_reviews/user_book_reviews.service';
import { BookReviewsScheduler } from './book_reviews/book_reviews.scheduler';

@Module({
  imports: [SequelizeModule.forFeature([BookReviews, UserBookReviews])],
  controllers: [],
  providers: [BookReviewsService, UserBookReviewsService, BookReviewsScheduler],
})
export class SchedulersModule {}
