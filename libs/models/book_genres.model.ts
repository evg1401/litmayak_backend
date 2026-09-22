import { Column, DataType, Index, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'book_genres', timestamps: false })
export class BookGenres extends Model {
  declare id: number;

  @Column({ type: DataType.STRING(50) })
  declare name: string;

  @Index
  @Column({ type: DataType.STRING(100) })
  declare slug: string;

  @Column({ type: DataType.INTEGER })
  declare order: number;
}
