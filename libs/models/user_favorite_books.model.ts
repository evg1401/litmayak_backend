import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Users } from './users.model';
import { Books } from './books.model';

@Table({
  tableName: 'user_favorite_books',
  indexes: [
    {
      name: 'user_favorite_books_user_id_book_id_uniq',
      unique: true,
      fields: ['user_id', 'book_id'],
    },
  ],
})
export class UserFavoriteBooks extends Model {
  declare id: number;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER })
  declare userId: number;

  @ForeignKey(() => Books)
  @Column({ type: DataType.INTEGER })
  declare bookId: number;

  @BelongsTo(() => Users)
  declare user: Users;

  @BelongsTo(() => Books)
  declare book: Books;
}
