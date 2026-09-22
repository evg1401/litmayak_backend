import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Books } from './books.model';
import { Users } from './users.model';
// import { BookCharacters } from './book_characters.model';

// оценки пользователей
@Table({
  tableName: 'user_book_reviews',
  indexes: [
    {
      name: 'user_book_reviews_user_id_book_id_uniq',
      unique: true,
      fields: ['user_id', 'book_id'],
    },
  ],
})
export class UserBookReviews extends Model {
  declare id: number;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER })
  declare userId: number;

  @ForeignKey(() => Books)
  @Column({ type: DataType.INTEGER })
  declare bookId: number;

  // @ForeignKey(() => BookCharacters)
  // @Column({ type: DataType.INTEGER })
  // declare bookCharacterId: number;

  @Column({ type: DataType.FLOAT })
  declare review: number;

  @Column({ type: DataType.FLOAT })
  declare stars: number;

  @BelongsTo(() => Users)
  declare user: Users;

  @BelongsTo(() => Books)
  declare book: Books;

  // @BelongsTo(() => BookCharacters)
  // declare bookCharacter: BookCharacters;
}
