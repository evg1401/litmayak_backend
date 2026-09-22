import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Users } from './users.model';
import { Authors } from './authors.model';

@Table({
  tableName: 'book_collections',
  indexes: [
    {
      name: 'book_collections_user_id_slug_uniq',
      unique: true,
      fields: ['user_id', 'slug'],
    },
  ],
})
export class BookCollections extends Model {
  declare id: number;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER })
  declare userId: number;

  @ForeignKey(() => Authors)
  @Column({ type: DataType.INTEGER })
  declare authorId: number;

  @Column({ type: DataType.STRING(50) })
  declare name: string;

  @Column({ type: DataType.STRING(100) })
  declare slug: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare status: boolean;

  @Column({ type: DataType.INTEGER })
  declare order: number;

  @BelongsTo(() => Users)
  declare user: Users;

  @BelongsTo(() => Authors)
  declare author: Authors;
}
