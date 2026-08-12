import { UserBookReviews } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserBookReviewRequestDto } from './dto/user_book_reviews.request';
import { Op } from 'sequelize';
import { CrudService } from 'libs/common/crud';

@Injectable()
export class UserBookReviewsService extends CrudService<UserBookReviews> {
  constructor(
    @InjectModel(UserBookReviews)
    protected model: typeof UserBookReviews,
  ) {
    super();
  }

  async addReview(
    userId: number,
    request: CreateUserBookReviewRequestDto,
  ): Promise<number> {
    const existingBookReview = await this.model.findOne({
      where: { userId, bookId: request.bookId },
    });

    if (existingBookReview) throw new Error('вы уже оценили эту книгу');

    const result = await this.create({
      ...request,
      userId,
    });

    return result.id;
  }

  async getListCursor(
    cursorId: number,
    limit: number,
  ): Promise<UserBookReviews[]> {
    return await this.model.findAll({
      where: { id: { [Op.gt]: cursorId } },
      limit,
      order: [['id', 'ASC']],
    });
  }
}
