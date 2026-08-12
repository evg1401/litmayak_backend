import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Books } from './books.model';
import { CreationOptional } from 'sequelize';

// средние оценки по книгам
@Table({ tableName: 'book_reviews' })
export class BookReviews extends Model {
  declare id: CreationOptional<number>;

  @ForeignKey(() => Books)
  @Column({ type: DataType.INTEGER })
  declare bookId: number;

  @Column({ type: DataType.FLOAT })
  declare avgReview: number;

  @Column({ type: DataType.INTEGER })
  declare count: number;

  @BelongsTo(() => Books)
  declare book: Books;
}
