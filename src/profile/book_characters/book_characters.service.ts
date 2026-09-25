import { BookCharacters } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CrudService } from 'libs/common/crud';
import { getBookDocumentConverter } from 'libs/common/book_document_converters';
import { Op } from 'sequelize';
import {
  CreateBookCharactersRequestDto,
  UpdateBookCharactersRequestDto,
} from './dto/book_characters.request.dto';
import { BooksService } from '@/books/books.service';
import { AuthorsService } from '@/profile/authors/authors.service';

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
    const converter = getBookDocumentConverter(documentPath);
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

    const xhtml = converter.sanitize(await converter.convert(documentPath));

    if (xhtml.trim() === '') {
      throw new Error('глава не содержит текста');
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
