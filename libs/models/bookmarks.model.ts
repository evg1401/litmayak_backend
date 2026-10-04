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
import { BookCharacters } from './book_characters.model';

@Table({
  tableName: 'bookmarks',
  indexes: [
    {
      name: 'bookmarks_user_id_book_id_uniq',
      unique: true,
      fields: ['user_id', 'book_id'],
    },
  ],
})
export class Bookmarks extends Model {
  declare id: number;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER })
  declare userId: number;

  @ForeignKey(() => Books)
  @Column({ type: DataType.INTEGER })
  declare bookId: number;

  @ForeignKey(() => BookCharacters)
  @Column({ type: DataType.INTEGER })
  declare characterId: number;

  @BelongsTo(() => Books)
  declare book: Books;

  @BelongsTo(() => BookCharacters)
  declare character: BookCharacters;
}
