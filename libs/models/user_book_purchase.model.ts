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

@Table({ tableName: 'user_book_purchase' })
export class UserBookPurchase extends Model {
  declare id: number;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER })
  declare userId: number;

  @ForeignKey(() => Books)
  @Column({ type: DataType.INTEGER })
  declare bookId: number;

  @Column({ type: DataType.BOOLEAN })
  declare status: boolean;

  @Column({ type: DataType.FLOAT })
  declare price: number;

  @BelongsTo(() => Users)
  declare user: Users;

  @BelongsTo(() => Books)
  declare book: Books;
}
