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
  tableName: 'author_follows',
  indexes: [
    {
      name: 'author_follows_user_id_author_id_uniq',
      unique: true,
      fields: ['user_id', 'author_id'],
    },
  ],
})
export class AuthorFollows extends Model {
  declare id: number;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER })
  declare userId: number;

  @ForeignKey(() => Authors)
  @Column({ type: DataType.INTEGER })
  declare authorId: number;

  @BelongsTo(() => Users)
  declare user: Users;

  @BelongsTo(() => Authors)
  declare author: Authors;
}
