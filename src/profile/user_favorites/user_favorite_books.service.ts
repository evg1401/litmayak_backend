import { UserFavoriteBooks } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CrudService } from 'libs/common/crud';

@Injectable()
export class UserFavoriteBooksService extends CrudService<UserFavoriteBooks> {
  constructor(
    @InjectModel(UserFavoriteBooks)
    protected model: typeof UserFavoriteBooks,
  ) {
    super();
  }
}
