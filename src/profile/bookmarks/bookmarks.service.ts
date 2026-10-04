import { Bookmarks, BookCharacters, Books, Authors } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

export interface BookmarkView {
  id: number;
  bookId: number;
  bookTitle: string;
  bookSlug: string;
  bookCover: string | null;
  authorNickname: string;
  chapterId: number;
  chapterTitle: string;
  chapterOrder: number;
  updatedAt: string;
}

function present(row: Bookmarks): BookmarkView {
  return {
    id: row.id,
    bookId: row.bookId,
    bookTitle: row.book?.name ?? '',
    bookSlug: row.book?.slug ?? '',
    bookCover: row.book?.images?.[0] ?? null,
    authorNickname: row.book?.author?.nickname ?? '',
    chapterId: row.characterId,
    chapterTitle: row.character?.name ?? '',
    chapterOrder: row.character?.order ?? 0,
    updatedAt: (row.get('updatedAt') as Date)?.toISOString?.() ?? '',
  };
}

@Injectable()
export class BookmarksService {
  constructor(
    @InjectModel(Bookmarks) protected model: typeof Bookmarks,
    @InjectModel(Books) protected booksRepository: typeof Books,
    @InjectModel(BookCharacters)
    protected charactersRepository: typeof BookCharacters,
  ) {}

  private readonly include = [
    {
      model: Books,
      attributes: ['name', 'slug', 'images'],
      include: [{ model: Authors, attributes: ['nickname'] }],
    },
    { model: BookCharacters, attributes: ['name', 'order'] },
  ];

  async getList(userId: number): Promise<BookmarkView[]> {
    const rows = await this.model.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
      include: this.include,
    });
    return rows.map(present);
  }

  async getOne(userId: number, bookId: number): Promise<BookmarkView | null> {
    const row = await this.model.findOne({
      where: { userId, bookId },
      include: this.include,
    });
    return row ? present(row) : null;
  }

  async upsert(
    userId: number,
    bookId: number,
    chapterId: number,
  ): Promise<BookmarkView> {
    const chapter = await this.charactersRepository.findOne({
      attributes: ['id'],
      where: { id: chapterId, bookId },
    });
    if (!chapter) throw new Error('глава не принадлежит этой книге');

    const [row] = await this.model.findOrCreate({
      where: { userId, bookId },
      defaults: { userId, bookId, characterId: chapterId },
    });
    if (row.characterId !== chapterId) {
      row.characterId = chapterId;
      await row.save();
    }

    const full = await this.model.findByPk(row.id, { include: this.include });
    return present(full!);
  }

  async remove(userId: number, bookId: number): Promise<number> {
    return this.model.destroy({ where: { userId, bookId } });
  }
}
