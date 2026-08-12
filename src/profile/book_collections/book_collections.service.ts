import { BookCollections } from '@models';
import { Injectable } from '@nestjs/common';
import slugConverter from 'slug';
import { CreateOrUpdateBookCollectionRequestDto } from './dto/book_collections.request';
import { CrudService } from 'libs/common/crud';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class BookCollectionsService extends CrudService<BookCollections> {
  constructor(
    @InjectModel(BookCollections)
    protected model: typeof BookCollections,
  ) {
    super();
  }

  async createCollection(
    userId: number,
    request: CreateOrUpdateBookCollectionRequestDto,
  ): Promise<BookCollections> {
    const slug = slugConverter(request.name, { locale: 'ru', lower: true });

    const existingCollection = await this.getItem({ where: { slug, userId } });
    if (existingCollection) throw new Error('коллекция уже существует');

    return this.create({
      name: request.name,
      slug,
      userId,
      status: true,
      order: request.order ?? 100,
    });
  }

  async getUserCollection(
    userId: number,
    bookCollectionId: number,
  ): Promise<BookCollections> {
    const bookCollection = await this.getItem({
      where: { id: bookCollectionId, userId },
    });

    if (!bookCollection) {
      throw new Error('коллекция книг не найдена');
    }

    return bookCollection;
  }

  async updateCollection(
    userId: number,
    bookCollectionId: number,
    request: CreateOrUpdateBookCollectionRequestDto,
  ): Promise<BookCollections> {
    const bookCollection = await this.getUserCollection(
      userId,
      bookCollectionId,
    );
    const slug = slugConverter(request.name, { locale: 'ru', lower: true });

    const existingCollection = await this.getItem({
      where: { userId, slug },
    });

    if (existingCollection && existingCollection.id !== bookCollectionId) {
      throw new Error('коллекция с таким наименованием уже существует');
    }

    const data = this.validateFieldsBeforeUpdate(request);
    await bookCollection.update({
      ...data,
    });

    return bookCollection;
  }
}
