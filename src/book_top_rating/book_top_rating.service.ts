import { Books, BookTopRating } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class BookTopRatingService {
  constructor(
    @InjectModel(BookTopRating) protected model: typeof BookTopRating,
  ) {}

  async getTop(limit: number): Promise<Books[]> {
    const rows = await this.model.findAll({
      where: { genreId: null },
      order: [['createdAt', 'DESC']],
      limit,
      include: [
        {
          model: Books,
          where: { status: true },
          attributes: { exclude: ['userId', 'authorId', 'updatedAt'] },
          include: [{ association: 'author', attributes: ['nickname'] }],
        },
      ],
    });

    return rows.map((row) => row.book);
  }
}
