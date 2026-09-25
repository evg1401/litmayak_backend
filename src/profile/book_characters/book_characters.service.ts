import { BookCharacters } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CrudService } from 'libs/common/crud';
import {
  DocumentConverter,
  getBookDocumentConverter,
  htmlToText,
} from 'libs/common/book_document_converters';
import { Op, Transaction } from 'sequelize';
import {
  CreateBookCharactersRequestDto,
  UpdateBookCharactersRequestDto,
} from './dto/book_characters.request.dto';
import { BooksService } from '@/books/books.service';
import { AuthorsService } from '@/profile/authors/authors.service';
import { BookCharacter } from 'libs/interfaces';

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

  async createCharacter(
    userId: number,
    bookId: number,
    request: CreateBookCharactersRequestDto,
  ) {
    const author = await this.authorsService.getAuthorProfileByUserId(userId);
    if (!author) throw new Error('пока вы не являетесь автором');

    const result = await this.createBookCharacter(author.id, {
      ...request,
      bookId,
    });

    return result.id;
  }

  async createBookCharacter(
    authorId: number,
    character: BookCharacter,
    transaction?: Transaction,
  ): Promise<BookCharacters> {
    const existingBook = await this.booksService.getByid(character.bookId, {
      include: {
        association: 'author',
        attributes: ['id'],
        where: { id: authorId },
        required: true,
      },
      transaction,
    });
    if (!existingBook) {
      throw new Error('выбранная книга не существет');
    }

    const currentCharacter = await this.getItem({
      where: { name: character.name, bookId: existingBook.id },
      transaction,
    });

    if (currentCharacter) {
      throw new Error('глава с таким названием уже существует');
    }

    return this.model.create(
      {
        ...character,
        order: character.order ?? 100,
      },
      { transaction },
    );
  }

  async getCharacter(
    id: number,
    bookId: number,
    userId: number,
  ): Promise<BookCharacters> {
    const author = await this.authorsService.getAuthorProfileByUserId(userId);
    if (!author) throw new Error('вы не являетесь автором');

    const character = await this.model.findOne({
      where: { id, bookId },
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
    bookId: number,
    userId: number,
    request: UpdateBookCharactersRequestDto,
  ): Promise<number> {
    const author = await this.authorsService.getAuthorProfileByUserId(userId);
    if (!author) throw new Error('вы не являетесь автором');

    const character = await this.model.findOne({
      where: { id, bookId },
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

    character.set(this.validateFieldsBeforeUpdate(request));
    if (!character.changed()) return 0;

    await character.save();

    return 1;
  }

  async updateCharacterContent(
    id: number,
    bookId: number,
    userId: number,
    documentPath: string,
  ): Promise<boolean> {
    const converter = getBookDocumentConverter(documentPath);
    if (!converter) throw new Error('формат документа не поддерживается');

    const author = await this.authorsService.getAuthorProfileByUserId(userId);
    if (!author) throw new Error('вы не являетесь автором');

    const character = await this.model.findOne({
      where: { id, bookId },
      attributes: ['id'],
      include: {
        association: 'book',
        attributes: ['id', 'authorId'],
        where: { authorId: author.id },
        required: true,
      },
    });
    if (!character) throw new Error('выбранной главы не существует');

    const xhtml = this.toCharacterXhtml(
      converter,
      await converter.convert(documentPath),
    );

    character.set({ xhtml });
    await character.save();

    return true;
  }

  // обработка html главы
  toCharacterXhtml(converter: DocumentConverter, html: string): string {
    const xhtml = converter.sanitize(html);

    if (!htmlToText(xhtml)) {
      throw new Error('глава не содержит текста');
    }

    return xhtml;
  }

  async deleteCharacter(
    id: number,
    bookId: number,
    userId: number,
  ): Promise<number> {
    const author = await this.authorsService.getAuthorProfileByUserId(userId);
    if (!author) throw new Error('вы не являетесь автором');

    const character = await this.model.findOne({
      where: { id, bookId },
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
