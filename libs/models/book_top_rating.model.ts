import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Books } from './books.model';
import { BookGenres } from './book_genres.model';

@Table({ tableName: 'book_top_rating' })
export class BookTopRating extends Model {
  declare id: number;

  @ForeignKey(() => Books)
  @Column({ type: DataType.INTEGER })
  declare bookId: number;

  @ForeignKey(() => BookGenres)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare genreId: number | null;

  @BelongsTo(() => Books)
  declare book: Books;

  @BelongsTo(() => BookGenres)
  declare genre: BookGenres;
}
