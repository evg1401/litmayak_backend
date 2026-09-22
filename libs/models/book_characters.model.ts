import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Books } from './books.model';

@Table({
  tableName: 'book_characters',
  indexes: [
    {
      name: 'book_characters_book_id_name_uniq',
      unique: true,
      fields: ['book_id', 'name'],
    },
  ],
})
export class BookCharacters extends Model {
  declare id: number;

  @ForeignKey(() => Books)
  @Column({ type: DataType.INTEGER })
  declare bookId: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare status: boolean;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare name: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare checkStatus: boolean;

  @Column({ type: DataType.STRING(255) })
  declare cdnLinkFolder: string;

  @Column({ type: DataType.TEXT })
  declare xhtml: string;

  @Column({ type: DataType.INTEGER })
  declare order: number;

  @BelongsTo(() => Books)
  declare book: Books;
}
