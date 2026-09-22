import { Authors, Books } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CrudService } from 'libs/common/crud';
import { Includeable, Order } from 'sequelize';
import { getOffsetFromPage } from '@/helpers';
import { PageList } from 'dto/response.dto';

@Injectable()
export class BooksService extends CrudService<Books> {
  constructor(
    @InjectModel(Books)
    protected model: typeof Books,
    @InjectModel(Authors)
    protected authorsRepository: typeof Authors,
  ) {
    super();
  }

  async getAuthorBooks(
    nickname: string,
    page: number = 1,
    limit: number = 100,
    attrs: string[] = [],
    order: Order = [['id', 'ASC']],
    include: Includeable[] = [],
  ): Promise<PageList<Books>> {
    const author = await this.getAuthorByNickname(nickname);
    if (!author) {
      return { count: 0, total: 0, items: [] };
    }

    const [total, items] = await Promise.all([
      this.model.count({ where: { authorId: author.id } }),
      this.model.findAll({
        where: { authorId: author.id },
        offset: getOffsetFromPage(page, limit),
        limit,
        order: this.validateOrder(order),
        attributes: {
          include: this.validateAttrs(attrs),
          exclude: ['authorId', 'updatedAt'],
        },
        include,
      }),
    ]);

    return { count: items.length, total, items };
  }

  async getAuthorBook(
    nickname: string,
    slug: string,
    include: Includeable[] = [],
  ): Promise<Books | null> {
    const author = await this.getAuthorByNickname(nickname);
    if (!author) return null;

    return this.getItem({
      where: { authorId: author.id, slug },
      include,
    });
  }

  private async getAuthorByNickname(
    nickname: string,
  ): Promise<Authors | null> {
    return this.authorsRepository.findOne({
      attributes: ['id'],
      where: { nickname },
    });
  }
}
