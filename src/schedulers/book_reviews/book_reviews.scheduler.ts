import { Injectable } from '@nestjs/common';
import { BookReviewsService } from '@/profile/book_reviews/book_reviews.service';
import { BookReviews, UserBookReviews } from '@models';
import { UserBookReviewsService } from '@/profile/book_reviews/user_book_reviews.service';
import { BookReview } from './dto/book_reviews.dto';
import { Cron } from '@nestjs/schedule';
import { AppLogger } from '@/logger/logger.service';
import { logErr } from '@/helpers';

@Injectable()
export class BookReviewsScheduler {
  constructor(
    private readonly logger: AppLogger,
    protected bookReviewsService: BookReviewsService,
    protected userBookReviewsService: UserBookReviewsService,
  ) {}

  @Cron('0 0 * * *')
  async CountAvgBookReviews(): Promise<void> {
    // загрузка новых оценок
    const allUserBookReviews = await this.getAllUserBookViews();
    if (allUserBookReviews.length === 0) {
      this.logger.log('нет новых оценок книг для обновления средних значений');

      return;
    }

    // загрузка средних оценок
    const allBookReviews = await this.getAllBookAvgReviews();
    const allBookReviewsObj = this.mapBookReviews(allBookReviews);
    // новые оценки (просто добавления)
    const newReviews: BookReview[] = [];

    // подсчет среднего и сбор оценок для обновления/добавления
    for (let index = 0; index < allUserBookReviews.length; index += 1) {
      const el = allUserBookReviews[index];

      const bookReviewItem: BookReviews = allBookReviewsObj[el.bookId];
      if (!bookReviewItem) {
        newReviews.push({
          bookId: el.bookId,
          avgReview: el.review,
          count: 1,
        });

        continue;
      }

      const currentSum = bookReviewItem.count * bookReviewItem.avgReview;
      const newSum = currentSum + el.review;
      const newCount = bookReviewItem.count + 1;

      const review = newSum / newCount;
      bookReviewItem.avgReview = Math.trunc(review * 10) / 10;
      bookReviewItem.count = newCount;
    }

    await Promise.all(Object.values(allBookReviewsObj).map((x) => x.save()));
    if (newReviews.length > 0) {
      await this.bookReviewsService.createBatch(newReviews);
    }

    await this.userBookReviewsService.clearAll();

    this.logger.log(
      'обновление средних оценок книг успешно завершено',
      'auto_upd_avg_book_ratings',
    );
  }

  async getAllBookAvgReviews(): Promise<BookReviews[]> {
    const limit = 100;
    let cursorId = 0;
    const allBookReviews: BookReviews[] = [];

    while (true) {
      try {
        const bookReviews = await this.bookReviewsService.getListCursor(
          cursorId,
          limit,
        );

        if (bookReviews.length === 0) {
          break;
        }

        allBookReviews.push(...bookReviews);

        if (bookReviews.length < limit) {
          break;
        }

        cursorId = bookReviews[bookReviews.length - 1].id;
      } catch (e) {
        logErr(
          this.logger,
          'Ошибка при при загрузке списка средних оценок книг',
          e,
        );

        break;
      }
    }

    return allBookReviews;
  }

  async getAllUserBookViews() {
    const limit = 100;
    let cursorId = 0;
    const result: UserBookReviews[] = [];

    while (true) {
      try {
        const userBookReviews = await this.userBookReviewsService.getListCursor(
          cursorId,
          limit,
        );

        if (userBookReviews.length === 0) {
          break;
        }

        result.push(...userBookReviews);

        if (userBookReviews.length < limit) {
          break;
        }

        cursorId = userBookReviews[userBookReviews.length - 1].id;
      } catch (e) {
        logErr(
          this.logger,
          'Ошибка при при загрузке списка новых оценок книг',
          e,
        );

        break;
      }
    }

    return result;
  }

  private mapBookReviews(
    bookReviews: BookReviews[],
  ): Record<string, BookReviews> {
    const result = {};

    bookReviews.forEach((el) => {
      result[el.bookId] = el;
    });

    return result;
  }
}
