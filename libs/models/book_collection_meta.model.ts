import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Books } from './books.model';
import { BookCollections } from './book_collections.model';

@Table({ tableName: 'book_collection_meta' })
export class BookCollectionsMeta extends Model {
  declare id: number;

  @ForeignKey(() => Books)
  @Column({ type: DataType.INTEGER })
  declare bookId: number;

  @ForeignKey(() => BookCollections)
  @Column({ type: DataType.INTEGER })
  declare bookCollectionId: number;

  @Column({ type: DataType.INTEGER })
  declare order: number;

  @BelongsTo(() => BookCollections)
  declare bookCollection: BookCollections;

  @BelongsTo(() => Books)
  declare book: Books;
}
