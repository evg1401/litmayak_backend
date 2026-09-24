import { Books, UserFavoriteBooks } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CrudService } from 'libs/common/crud';
import { Order } from 'sequelize';
import { getOffsetFromPage } from '@/helpers';
import { PageList } from 'dto/response.dto';

@Injectable()
export class UserFavoriteBooksService extends CrudService<UserFavoriteBooks> {
  constructor(
    @InjectModel(UserFavoriteBooks)
    protected model: typeof UserFavoriteBooks,
    @InjectModel(Books)
    protected booksRepository: typeof Books,
  ) {
    super();
  }

  async addToFavorite(userId: number, bookId: number): Promise<number> {
    const existingFavorite = await this.getItem({ where: { userId, bookId } });

    if (existingFavorite) {
      return existingFavorite.id;
    }

    const existingBook = await this.booksRepository.findByPk(bookId);

    if (!existingBook) {
      throw new Error('книга не найдена');
    }

    const favorite = await this.create({ userId, bookId });

    return favorite.id;
  }

  async getUserFavorites(
    userId: number,
    page: number = 1,
    limit: number = 100,
    attrs: string[] = [],
    order: Order = [['id', 'ASC']],
  ): Promise<PageList<UserFavoriteBooks>> {
    const [total, items] = await Promise.all([
      this.model.count({ where: { userId } }),
      this.model.findAll({
        where: { userId },
        offset: getOffsetFromPage(page, limit),
        limit,
        order: this.validateOrder(order),
        attributes: {
          include: this.validateAttrs(attrs),
          exclude: ['userId', 'updatedAt'],
        },
      }),
    ]);

    return { count: items.length, total, items };
  }

  async deleteFromFavorite(userId: number, bookIds: number[]): Promise<number> {
    return this.delete({ where: { userId, bookId: bookIds } });
  }
}
