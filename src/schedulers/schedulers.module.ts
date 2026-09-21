import { Module } from '@nestjs/common';
import { BookReviewsModule } from '@/profile/book_reviews/book_reviews.module';
import { BookReviewsScheduler } from './book_reviews/book_reviews.scheduler';

@Module({
  imports: [BookReviewsModule],
  controllers: [],
  providers: [BookReviewsScheduler],
})
export class SchedulersModule {}
