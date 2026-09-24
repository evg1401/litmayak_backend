import { Authors, Books, PublishingHouses } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateBooksRequestDto,
  UpdateBooksRequestDto,
} from './dto/books.request.dto';
import slugConverter from 'slug';

@Injectable()
export class ProfileBooksService {
  constructor(
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

    const slug = slugConverter(request.name, { locale: 'ru', lower: true });

    const existingBook = await this.booksRepository.findOne({
      attributes: ['author_id', 'slug'],
      where: { authorId: author.id, slug },
    });
    if (existingBook) throw new Error('книга с таким названием уже существует');

    return this.booksRepository.create({
      ...request,
      authorId: author.id,
      slug,
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
