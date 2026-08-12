import { BookReviews } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CrudService } from 'libs/common/crud';

@Injectable()
export class BookReviewsService extends CrudService<BookReviews> {
  constructor(
    @InjectModel(BookReviews)
    protected model: typeof BookReviews,
  ) {
    super();
  }

  async getListCursor(cursorId: number, limit: number): Promise<BookReviews[]> {
    return await this.model.findAll({
      where: { id: { [Op.gt]: cursorId } },
      limit,
      order: [['id', 'ASC']],
    });
  }
}
