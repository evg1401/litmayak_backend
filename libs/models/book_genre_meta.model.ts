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

@Table({ tableName: 'book_genre_meta' })
export class BookGenreMeta extends Model {
  declare id: number;

  @ForeignKey(() => Books)
  @Column({ type: DataType.INTEGER })
  declare bookId: number;

  @ForeignKey(() => BookGenres)
  @Column({ type: DataType.INTEGER })
  declare genreId: number;

  @Column({ type: DataType.INTEGER })
  declare order: number;

  @BelongsTo(() => BookGenres)
  declare genre: BookGenres;

  @BelongsTo(() => Books)
  declare book: Books;
}
