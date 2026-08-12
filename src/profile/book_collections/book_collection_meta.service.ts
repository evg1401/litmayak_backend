import { BookCollectionsMeta } from '@models';
import { Injectable } from '@nestjs/common';
import { CrudService } from 'libs/common/crud';
import { BooksService } from '@/books/books.service';
import { BookCollectionsService } from '@/profile/book_collections/book_collections.service';
import { InjectModel } from '@nestjs/sequelize';
import { AddBookToCollectionRequestDto } from './dto/book_collections.request';

@Injectable()
export class BookCollectionMetaService extends CrudService<BookCollectionsMeta> {
  constructor(
    protected booksService: BooksService,
    protected bookCollectionService: BookCollectionsService,
    @InjectModel(BookCollectionsMeta)
    protected model: typeof BookCollectionsMeta,
  ) {
    super();
  }

  async addBook(
    userId: number,
    { bookCollectionId, bookId, order }: AddBookToCollectionRequestDto,
  ): Promise<number> {
    await this.bookCollectionService.getUserCollection(
      userId,
      bookCollectionId,
    );

    const book = await this.booksService.getByid(bookId);
    if (!book) {
      throw new Error('книга не найдена');
    }

    const existingCollectionBook = await this.getItem({
      where: { bookCollectionId, bookId },
    });

    if (existingCollectionBook) throw new Error('книга уже есть в избранном');

    const collectionBook = await this.model.create({
      bookCollectionId,
      bookId,
      order: order ?? 100,
    });

    return collectionBook.id;
  }

  async deleteBooks(
    userId: number,
    bookCollectionId: number,
    bookIds: number[],
  ): Promise<number> {
    await this.bookCollectionService.getUserCollection(
      userId,
      bookCollectionId,
    );

    return this.delete({
      where: { bookCollectionId, bookId: bookIds },
    });
  }

  async countCollectionBooks(bookCollectionId: number): Promise<number> {
    return this.model.count({
      where: { bookCollectionId },
    });
  }
}
