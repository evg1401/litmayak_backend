import { Injectable } from '@nestjs/common';
import { CrudService } from 'libs/common/crud';
import { BookGenreMeta } from 'libs/models/book_genre_meta.model';
import { Books } from '@models';
import { getOffsetFromPage } from '@/helpers';
import { Order } from 'sequelize';
import { PageList } from 'dto/response.dto';
import { GenresService } from './genres.service';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class GenresMetaService extends CrudService<BookGenreMeta> {
  constructor(
    protected genresService: GenresService,
    @InjectModel(BookGenreMeta)
    protected model: typeof BookGenreMeta,
  ) {
    super();
  }

  async getGenreBooks(
    slug: string,
    page: number = 1,
    limit: number = 100,
    attrs: string[] = [],
    order: Order = [['id', 'ASC']],
  ): Promise<PageList<BookGenreMeta>> {
    const genre = await this.genresService.getItem({ where: { slug } });
    if (!genre) {
      return { count: 0, total: 0, items: [] };
    }

    const [total, items] = await Promise.all([
      this.model.count({ where: { genreId: genre.id } }),
      this.model.findAll({
        offset: getOffsetFromPage(page, limit),
        limit,
        order,
        attributes: {
          include: this.validateAttrs(attrs),
          exclude: ['id', 'bookId', 'genreId', 'createdAt', 'updatedAt'],
        },
        include: {
          model: Books,
          attributes: {
            exclude: ['userId', 'authorId', 'createdAt', 'updatedAt'],
          },
        },
      }),
    ]);

    return { count: items.length, total, items };
  }
}
