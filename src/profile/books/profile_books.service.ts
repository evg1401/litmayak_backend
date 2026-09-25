import { Authors, Books, PublishingHouses } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { getBookDocumentConverter } from 'libs/common/book_document_converters';
import {
  CreateBooksRequestDto,
  UpdateBooksRequestDto,
} from './dto/books.request.dto';
import slugConverter from 'slug';
import { BookCharactersService } from '@/profile/book_characters/book_characters.service';

@Injectable()
export class ProfileBooksService {
  constructor(
    private readonly sequelize: Sequelize,
    protected readonly bookCharactersService: BookCharactersService,
    @InjectModel(Books)
    protected booksRepository: typeof Books,
    @InjectModel(PublishingHouses)
    protected publishingHousesRepository: typeof PublishingHouses,
    @InjectModel(Authors)
    protected authorsRepository: typeof Authors,
  ) {}

  async create(userId: number, request: CreateBooksRequestDto): Promise<Books> {
    const author = await this.getAuthorByUserId(userId);

    if (request.publishingHouseId) {
      const existingPublishingHouses =
        await this.publishingHousesRepository.findByPk(
          request.publishingHouseId,
        );

      if (!existingPublishingHouses) {
        throw new Error('указан не существующий издательский дом');
      }
    }

    const slug = await this.getFreeBookSlug(author.id, request.name);

    return this.booksRepository.create({
      ...request,
      authorId: author.id,
      slug,
    });
  }

  async createFromFile(userId: number, documentPath: string): Promise<Books> {
    // если заголовок окажется слишком длинным
    const BOOK_NAME_MAX_LENGTH = 256;
    const CHARACTER_NAME_MAX_LENGTH = 255;

    const converter = getBookDocumentConverter(documentPath);
    if (!converter?.parseBook) {
      throw new Error('формат документа не поддерживается');
    }

    const author = await this.getAuthorByUserId(userId);

    const document = await converter.parseBook(documentPath);

    const name = document.title.slice(0, BOOK_NAME_MAX_LENGTH).trim();
    if (!name) throw new Error('в документе не указано название книги');

    const characters = document.characters.map((character) => ({
      name: character.name.slice(0, CHARACTER_NAME_MAX_LENGTH).trim(),
      xhtml: this.bookCharactersService.toCharacterXhtml(
        converter,
        character.html,
      ),
    }));
    if (characters.length === 0) {
      throw new Error('документ не содержит глав с текстом');
    }

    const slug = await this.getFreeBookSlug(author.id, name);

    return this.sequelize.transaction(async (transaction) => {
      const book = await this.booksRepository.create(
        { name, authorId: author.id, slug },
        { transaction },
      );

      for (const [index, character] of characters.entries()) {
        await this.bookCharactersService.createBookCharacter(
          author.id,
          { ...character, bookId: book.id, order: index + 1 },
          transaction,
        );
      }

      return book;
    });
  }

  async update(
    userId: number,
    id: number,
    request: UpdateBooksRequestDto,
  ): Promise<number> {
    const author = await this.getAuthorByUserId(userId);

    if (request.name) {
      const slug = slugConverter(request.name, { locale: 'ru', lower: true });

      const existingBook = await this.booksRepository.findOne({
        attributes: ['id'],
        where: { authorId: author.id, slug },
      });
      if (existingBook && existingBook.id !== id) {
        throw new Error('книга с таким названием уже существует');
      }

      request['slug'] = slug;
    }

    const result = await this.booksRepository.update(
      { ...request },
      { where: { id, authorId: author.id } },
    );

    return result[0];
  }

  private async getFreeBookSlug(
    authorId: number,
    name: string,
  ): Promise<string> {
    const slug = slugConverter(name, { locale: 'ru', lower: true });

    const existingBook = await this.booksRepository.findOne({
      attributes: ['author_id', 'slug'],
      where: { authorId, slug },
    });
    if (existingBook) throw new Error('книга с таким названием уже существует');

    return slug;
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
