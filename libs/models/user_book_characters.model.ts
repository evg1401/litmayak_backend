import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Users } from './users.model';
import { BookCharacters } from './book_characters.model';

@Table({ tableName: 'user_book_characters' })
export class UserBookCharacters extends Model {
  declare id: number;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER })
  declare userId: number;

  @ForeignKey(() => BookCharacters)
  @Column({ type: DataType.INTEGER })
  declare bookCharacterId: number;

  @Column({ type: DataType.FLOAT })
  declare progress: number;

  @BelongsTo(() => Users)
  declare user: Users;

  @BelongsTo(() => BookCharacters)
  declare bookCharacter: BookCharacters;
}
