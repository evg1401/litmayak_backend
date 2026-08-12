import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Books } from './books.model';

@Table({ tableName: 'book_characters' })
export class BookCharacters extends Model {
  declare id: number;

  @ForeignKey(() => Books)
  @Column({ type: DataType.INTEGER })
  declare bookId: number;

  @Column({ type: DataType.BOOLEAN })
  declare status: boolean;

  @Column({ type: DataType.BOOLEAN })
  declare checkStatus: boolean;

  @Column({ type: DataType.STRING(255) })
  declare cdnLinkFolder: string;

  @Column({ type: DataType.TEXT })
  declare xhtml: string;

  @Column({ type: DataType.INTEGER })
  declare order: number;
}
