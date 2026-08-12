import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Books } from './books.model';
import { BookCharacters } from './book_characters.model';
import { Users } from './users.model';

@Table({ tableName: 'check_logs' })
export class CheckLogs extends Model {
  declare id: number;

  @ForeignKey(() => Books)
  @Column({ type: DataType.INTEGER })
  declare bookId: number;

  @ForeignKey(() => BookCharacters)
  @Column({ type: DataType.INTEGER })
  declare bookCharacterId: number;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER })
  declare userId: number;

  @Column({ type: DataType.BOOLEAN })
  declare status: boolean;

  @Column({ type: DataType.TEXT })
  declare comment: string;

  @BelongsTo(() => BookCharacters)
  declare bookCharacter: BookCharacters;

  @BelongsTo(() => Books)
  declare book: Books;

  @BelongsTo(() => Users)
  declare user: Users;
}
