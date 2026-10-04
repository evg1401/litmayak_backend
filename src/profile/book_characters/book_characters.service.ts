import { BookCharacters } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CrudService } from 'libs/common/crud';
import { Op } from 'sequelize';
import { extname } from 'node:path';
import { findDocumentConverter } from './converters';
import { normalizeOwnMediaKey, sanitizeHtml } from '@/helpers';
import {
  CreateBookCharactersRequestDto,
  UpdateBookCharactersRequestDto,
} from './dto/book_characters.request.dto';
import { BooksService } from '@/books/books.service';
import { AuthorsService } from '@/profile/authors/authors.service';

export interface ChapterListItem {
  id: number;
  name: string;
  status: boolean;
  order: number;
  wordsCount: number;
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
export class BookCharactersService extends CrudService<BookCharacters> {
  constructor(
    protected readonly booksService: BooksService,
    protected readonly authorsService: AuthorsService,
    @InjectModel(BookCharacters)
    protected model: typeof BookCharacters,
  ) {
    super();
  }

  async getBookCharacters(
    bookId: number,
    userId: number,
  ): Promise<ChapterListItem[]> {
    const author = await this.authorsService.getAuthorProfileByUserId(userId);
    if (!author) throw new Error('вы не являетесь автором');

    const book = await this.booksService.getByid(bookId, {
      include: {
        association: 'author',
        attributes: ['id'],
        where: { id: author.id },
        required: true,
      },
    });
    if (!book) throw new Error('выбранная книга не существует');

    const characters = await this.model.findAll({
      where: { bookId },
      order: [
        ['order', 'ASC'],
        ['id', 'ASC'],
      ],
    });

    return characters.map((character) => ({
      id: character.id,
      name: character.name,
      status: character.status,
      order: character.order,
      wordsCount: countWords(character.xhtml),
    }));
  }

  async publishDraftCharacters(
    bookId: number,
    userId: number,
  ): Promise<number> {
    const author = await this.authorsService.getAuthorProfileByUserId(userId);
    if (!author) throw new Error('вы не являетесь автором');

    const book = await this.booksService.getByid(bookId, {
      include: {
        association: 'author',
        attributes: ['id'],
        where: { id: author.id },
        required: true,
      },
    });
    if (!book) throw new Error('выбранная книга не существует');

    const [count] = await this.model.update(
      { status: true },
      { where: { bookId, status: false } },
    );

    return count;
  }

  async createCharacter(
    userId: number,
    request: CreateBookCharactersRequestDto,
  ) {
    const author = await this.authorsService.getAuthorProfileByUserId(userId);
    if (!author) throw new Error('пока вы не являетесь автором');

    const existingBook = await this.booksService.getByid(request.bookId, {
      include: {
        association: 'author',
        attributes: ['id'],
        where: { id: author.id },
        required: true,
      },
    });
    if (!existingBook) {
      throw new Error('выбранная книга не существет');
    }

    const currentCharacter = await this.getItem({
      where: { name: request.name, bookId: existingBook.id },
    });

    if (currentCharacter) {
      throw new Error('глава с таким названием уже существует');
    }

    const result = await this.model.create({
      ...request,
      cdnLinkFolder: await normalizeOwnMediaKey(userId, request.cdnLinkFolder),
      order: request.order ?? 100,
    });

    return result.id;
  }

  async getCharacter(id: number, userId: number): Promise<BookCharacters> {
    const author = await this.authorsService.getAuthorProfileByUserId(userId);
    if (!author) throw new Error('вы не являетесь автором');

    const character = await this.model.findByPk(id, {
      include: {
        association: 'book',
        attributes: ['id'],
        where: { authorId: author.id },
        required: true,
      },
    });
    if (!character) throw new Error('выбранной главы не существует');

    return character;
  }

  async updateCharacter(
    id: number,
    userId: number,
    request: UpdateBookCharactersRequestDto,
  ): Promise<number> {
    const author = await this.authorsService.getAuthorProfileByUserId(userId);
    if (!author) throw new Error('вы не являетесь автором');

    const character = await this.model.findByPk(id, {
      include: {
        association: 'book',
        attributes: ['id', 'authorId'],
        where: { authorId: author.id },
        required: true,
      },
    });
    if (!character) throw new Error('выбранной главы не существует');

    if (request.name && request.name !== character.name) {
      const duplicate = await this.model.findOne({
        attributes: ['id'],
        where: {
          bookId: character.bookId,
          name: request.name,
          id: { [Op.ne]: character.id },
        },
      });

      if (duplicate) throw new Error('глава с таким именем уже существует');
    }

    if (request.cdnLinkFolder) {
      request.cdnLinkFolder = await normalizeOwnMediaKey(
        userId,
        request.cdnLinkFolder,
      );
    }

    character.set(this.validateFieldsBeforeUpdate(request));
    if (!character.changed()) return 0;

    await character.save();

    return 1;
  }

  async updateCharacterContent(
    id: number,
    userId: number,
    documentPath: string,
  ): Promise<boolean> {
    const converter = findDocumentConverter(
      extname(documentPath).toLowerCase(),
    );
    if (!converter) throw new Error('формат документа не поддерживается');

    const author = await this.authorsService.getAuthorProfileByUserId(userId);
    if (!author) throw new Error('вы не являетесь автором');

    const character = await this.model.findByPk(id, {
      attributes: ['id'],
      include: {
        association: 'book',
        attributes: ['id', 'authorId'],
        where: { authorId: author.id },
        required: true,
      },
    });
    if (!character) throw new Error('выбранной главы не существует');

    const xhtml = sanitizeHtml(await converter.convert(documentPath));

    if (!xhtml.trim()) {
      throw new Error('документ не содержит текста');
    }

    character.set({ xhtml });
    await character.save();

    return true;
  }

  async deleteCharacter(id: number, userId: number): Promise<number> {
    const author = await this.authorsService.getAuthorProfileByUserId(userId);
    if (!author) throw new Error('вы не являетесь автором');

    const character = await this.model.findByPk(id, {
      attributes: ['id'],
      include: {
        association: 'book',
        attributes: ['id', 'authorId'],
        where: { authorId: author.id },
        required: true,
      },
    });
    if (!character) throw new Error('выбранной главы не существует');

    return this.delete({ where: { id: character.id } });
  }
}
