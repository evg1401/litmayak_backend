import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';

@Table({ tableName: 'book_genres', timestamps: false })
export class BookGenres extends Model {
  declare id: number;

  @Column({ type: DataType.STRING(50) })
  declare name: string;

  @Index({ unique: true })
  @Column({ type: DataType.STRING(100) })
  declare slug: string;

  @Column({ type: DataType.INTEGER })
  declare order: number;

  @ForeignKey(() => BookGenres)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare parentId: number | null;

  @BelongsTo(() => BookGenres, { foreignKey: 'parentId' })
  declare parent: BookGenres;

  @HasMany(() => BookGenres, { foreignKey: 'parentId' })
  declare children: BookGenres[];
}
