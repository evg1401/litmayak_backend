import { Authors, BookCharacters, Books } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CrudService } from 'libs/common/crud';
import { Includeable, Op, Order, WhereOptions } from 'sequelize';
import { getOffsetFromPage } from '@/helpers';
import { PageList } from 'dto/response.dto';

export interface PublicChapterListItem {
  id: number;
  name: string;
  order: number;
  wordsCount: number;
  createdAt: string;
}

export interface PublicChapterDetail {
  id: number;
  name: string;
  order: number;
  xhtml: string | null;
  wordsCount: number;
  createdAt: string;
}

function countWords(xhtml: string | null | undefined): number {
  if (!xhtml) return 0;
  const text = xhtml
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
}

@Injectable()
export class BooksService extends CrudService<Books> {
  constructor(
    @InjectModel(Books)
    protected model: typeof Books,
    @InjectModel(Authors)
    protected authorsRepository: typeof Authors,
    @InjectModel(BookCharacters)
    protected charactersRepository: typeof BookCharacters,
  ) {
    super();
  }

  private buildPublicWhere(search?: string): WhereOptions {
    const where: WhereOptions = { status: true };
    const trimmed = search?.trim().slice(0, 200);
    if (trimmed) {
      where.name = { [Op.iLike]: `%${trimmed}%` };
    }
    return where;
  }

  async getPublicList(
    page: number = 1,
    limit: number = 100,
    attrs: string[] = [],
    order: Order = [['id', 'ASC']],
    include: Includeable[] = [],
    search?: string,
  ): Promise<Books[]> {
    return this.model.findAll({
      where: this.buildPublicWhere(search),
      offset: getOffsetFromPage(page, limit),
      limit,
      order: this.validateOrder(order),
      attributes: {
        include: this.validateAttrs(attrs),
        exclude: ['authorId', 'updatedAt'],
      },
      include,
    });
  }

  async countPublicListItems(): Promise<number> {
    return this.model.count({ where: { status: true } });
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

    const where = { authorId: author.id, status: true };
    const [total, items] = await Promise.all([
      this.model.count({ where }),
      this.model.findAll({
        where,
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
      where: { authorId: author.id, slug, status: true },
      include,
    });
  }

  private async getAuthorByNickname(nickname: string): Promise<Authors | null> {
    return this.authorsRepository.findOne({
      attributes: ['id'],
      where: { nickname },
    });
  }

  async getPublicChapters(
    nickname: string,
    slug: string,
  ): Promise<PublicChapterListItem[] | null> {
    const book = await this.getAuthorBook(nickname, slug);
    if (!book) return null;

    const characters = await this.charactersRepository.findAll({
      where: { bookId: book.id, status: true },
      order: [
        ['order', 'ASC'],
        ['id', 'ASC'],
      ],
    });

    return characters.map((character) => ({
      id: character.id,
      name: character.name,
      order: character.order,
      wordsCount: countWords(character.xhtml),
      createdAt: character.get('createdAt') as string,
    }));
  }

  async getPublicChapter(
    nickname: string,
    slug: string,
    chapterId: number,
  ): Promise<PublicChapterDetail | null> {
    const book = await this.getAuthorBook(nickname, slug);
    if (!book) return null;

    const character = await this.charactersRepository.findOne({
      where: { id: chapterId, bookId: book.id, status: true },
    });
    if (!character) return null;

    return {
      id: character.id,
      name: character.name,
      order: character.order,
      xhtml: character.xhtml,
      wordsCount: countWords(character.xhtml),
      createdAt: character.get('createdAt') as string,
    };
  }
}
