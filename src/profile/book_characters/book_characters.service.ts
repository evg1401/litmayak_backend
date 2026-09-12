import { BookCharacters } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CrudService } from 'libs/common/crud';
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

    const existingBook = await this.booksService.getByid(request.bookId);
    if (existingBook?.authorId != author.id) {
      throw new Error('выбранная книга не существет');
    }

    const currentCharacter = await this.getItem({
      where: { name: request.name },
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

  async updateCharacter(
    chatacterId: number,
    userId: number,
    request: UpdateBookCharactersRequestDto,
  ) {
    return 0;
  }
}
