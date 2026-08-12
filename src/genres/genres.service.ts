import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CrudService } from 'libs/common/crud';
import { BookGenres } from 'libs/models/book_genres.model';

@Injectable()
export class GenresService extends CrudService<BookGenres> {
  constructor(
    @InjectModel(BookGenres)
    protected model: typeof BookGenres,
  ) {
    super();
  }
}
