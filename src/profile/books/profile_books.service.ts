import { Authors, Books, PublishingHouses, UserFavoriteBooks } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateBooksRequestDto,
  UpdateBooksRequestDto,
} from './dto/books.request.dto';
import slugConverter from 'slug';
import { UserFavoriteBooksService } from '@/profile/user_favorites/user_favorite_books.service';

@Injectable()
export class ProfileBooksService {
  constructor(
    protected userFavoriteBooksService: UserFavoriteBooksService,
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
      request['slug'] = slugConverter(request.name, {
        locale: 'ru',
        lower: true,
      });
    }

    const result = await this.booksRepository.update(
      { ...request },
      { where: { id, authorId: author.id } },
    );

    return result[0];
  }

  async addToFavorite(userId: number, bookId: number): Promise<number> {
    const existingFavorite = await this.userFavoriteBooksService.getItem({
      where: { userId, bookId },
    });

    if (existingFavorite) {
      return existingFavorite.id;
    }

    const existingBook = await this.booksRepository.findByPk(bookId);

    if (!existingBook) {
      throw new Error('книга не найдена');
    }

    const favorite = await this.userFavoriteBooksService.create({
      userId,
      bookId,
    });

    return favorite.id;
  }

  async deleteFromFavorite(userId: number, bookIds: number[]): Promise<number> {
    return this.userFavoriteBooksService.delete({
      where: { userId, bookId: bookIds },
    });
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
