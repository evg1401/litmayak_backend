import { Books } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CrudService } from 'libs/common/crud';

@Injectable()
export class BooksService extends CrudService<Books> {
  constructor(
    @InjectModel(Books)
    protected model: typeof Books,
  ) {
    super();
  }
}
