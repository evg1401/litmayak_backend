import {
  Authors,
  Books,
  BookCharacters,
  BookGenreMeta,
  BookGenres,
  PublishingHouses,
} from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateBooksRequestDto,
  UpdateBooksRequestDto,
} from './dto/books.request.dto';
import slugConverter from 'slug';
import { getOffsetFromPage, normalizeOwnMediaKeys } from '@/helpers';
import { PageList } from 'dto/response.dto';

export interface OwnBookView {
  id: number;
  name: string;
  slug: string;
  images: string[];
  status: boolean;
  genres: string[];
  chaptersCount: number;
  createdAt: Date;
}

export interface OwnBookDetail {
  id: number;
  name: string;
  description: string;
  language: string;
  year: string;
  uid: string;
  images: string[];
  status: boolean;
  publishingHouseId: number | null;
  genreIds: number[];
  chaptersCount: number;
}

@Injectable()
export class ProfileBooksService {
  constructor(
    @InjectModel(Books)
    protected booksRepository: typeof Books,
    @InjectModel(PublishingHouses)
    protected publishingHousesRepository: typeof PublishingHouses,
    @InjectModel(Authors)
    protected authorsRepository: typeof Authors,
    @InjectModel(BookGenres)
    protected genresRepository: typeof BookGenres,
    @InjectModel(BookGenreMeta)
    protected genreMetaRepository: typeof BookGenreMeta,
    @InjectModel(BookCharacters)
    protected charactersRepository: typeof BookCharacters,
  ) {}

  async getOwnBooks(
    userId: number,
    page = 1,
    limit = 100,
  ): Promise<PageList<OwnBookView>> {
    const author = await this.getAuthorByUserId(userId);

    const [total, books] = await Promise.all([
      this.booksRepository.count({ where: { authorId: author.id } }),
      this.booksRepository.findAll({
        where: { authorId: author.id },
        offset: getOffsetFromPage(page, limit),
        limit,
        order: [['id', 'DESC']],
        include: [
          {
            model: BookGenreMeta,
            separate: true,
            order: [['order', 'ASC']],
            include: [{ model: BookGenres, attributes: ['name'] }],
          },
          {
            model: BookCharacters,
            separate: true,
            attributes: ['id'],
          },
        ],
      }),
    ]);

    return {
      count: books.length,
      total,
      items: books.map((book) => this.presentOwnBook(book)),
    };
  }

  private presentOwnBook(book: Books): OwnBookView {
    return {
      id: book.id,
      name: book.name,
      slug: book.slug,
      images: book.images ?? [],
      status: book.status,
      genres: (book.genreMeta ?? [])
        .map((meta) => meta.genre?.name)
        .filter((name): name is string => !!name),
      chaptersCount: book.characters?.length ?? 0,
      createdAt: book.createdAt,
    };
  }

  async getOwnBook(userId: number, id: number): Promise<OwnBookDetail> {
    const author = await this.getAuthorByUserId(userId);

    const book = await this.booksRepository.findOne({
      where: { id, authorId: author.id },
      include: [
        { model: BookGenreMeta, separate: true, attributes: ['genreId'] },
        { model: BookCharacters, separate: true, attributes: ['id'] },
      ],
    });
    if (!book) throw new Error('книга не найдена');

    return {
      id: book.id,
      name: book.name,
      description: book.description ?? '',
      language: book.language ?? '',
      year: book.year ?? '',
      uid: book.uid ?? '',
      images: book.images ?? [],
      status: book.status,
      publishingHouseId: book.publishingHouseId,
      genreIds: (book.genreMeta ?? []).map((meta) => meta.genreId),
      chaptersCount: book.characters?.length ?? 0,
    };
  }

  async deleteOwnBook(userId: number, id: number): Promise<void> {
    const author = await this.getAuthorByUserId(userId);

    const book = await this.booksRepository.findOne({
      attributes: ['id'],
      where: { id, authorId: author.id },
    });
    if (!book) throw new Error('книга не найдена');

    await this.booksRepository.destroy({ where: { id } });
  }

  async create(userId: number, request: CreateBooksRequestDto): Promise<Books> {
    const author = await this.getAuthorByUserId(userId);
    const { genreIds, ...bookFields } = request;

    if (bookFields.publishingHouseId) {
      const existingPublishingHouses =
        await this.publishingHousesRepository.findByPk(
          bookFields.publishingHouseId,
        );

      if (!existingPublishingHouses) {
        throw new Error('указан не существующий издательский дом');
      }
    }

    const slug = slugConverter(bookFields.name, { locale: 'ru', lower: true });

    const existingBook = await this.booksRepository.findOne({
      attributes: ['author_id', 'slug'],
      where: { authorId: author.id, slug },
    });
    if (existingBook) throw new Error('книга с таким названием уже существует');

    const book = await this.booksRepository.create({
      ...bookFields,
      authorId: author.id,
      slug,
    });

    if (genreIds?.length) {
      await this.syncGenres(book.id, genreIds);
    }

    return book;
  }

  async update(
    userId: number,
    id: number,
    request: UpdateBooksRequestDto,
  ): Promise<number> {
    const author = await this.getAuthorByUserId(userId);
    const { genreIds, ...bookFields } = request;

    // нельзя опубликовать книгу, если нет опубликованных глав
    if (bookFields.status === true) {
      const publishedChaptersCount = await this.charactersRepository.count({
        where: { bookId: id, status: true },
      });
      if (publishedChaptersCount === 0) {
        throw new Error(
          'нельзя опубликовать книгу без ни одной опубликованной главы',
        );
      }
    }

    if (bookFields.name) {
      const slug = slugConverter(bookFields.name, {
        locale: 'ru',
        lower: true,
      });

      const existingBook = await this.booksRepository.findOne({
        attributes: ['id'],
        where: { authorId: author.id, slug },
      });
      if (existingBook && existingBook.id !== id) {
        throw new Error('книга с таким названием уже существует');
      }

      bookFields['slug'] = slug;
    }

    if (bookFields.images) {
      bookFields.images = await normalizeOwnMediaKeys(
        userId,
        bookFields.images,
      );
    }

    const result = await this.booksRepository.update(
      { ...bookFields },
      { where: { id, authorId: author.id } },
    );

    if (genreIds !== undefined) {
      await this.syncGenres(id, genreIds);
    }

    return result[0];
  }

  private async syncGenres(bookId: number, genreIds: number[]): Promise<void> {
    const uniqueIds = [...new Set(genreIds)];

    if (uniqueIds.length) {
      const existingCount = await this.genresRepository.count({
        where: { id: uniqueIds },
      });
      if (existingCount !== uniqueIds.length) {
        throw new Error('указан не существующий жанр или поджанр');
      }
    }

    await this.genreMetaRepository.destroy({ where: { bookId } });

    if (uniqueIds.length) {
      await this.genreMetaRepository.bulkCreate(
        uniqueIds.map((genreId, order) => ({ bookId, genreId, order })),
      );
    }
  }

  private async getAuthorByUserId(userId: number): Promise<Authors> {
    const author = await this.authorsRepository.findOne({
      where: { userId },
    });

    if (!author) {
      throw new Error('пользователь не является автором');
    }

    return author;
  }
}
