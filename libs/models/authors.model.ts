import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Users } from './users.model';

@Table({
  tableName: 'authors',
  indexes: [
    {
      name: 'authors_user_id_uniq',
      unique: true,
      fields: ['user_id'],
    },
    {
      name: 'authors_phone',
      fields: ['phone'],
    },
    {
      name: 'authors_nickname',
      unique: true,
      fields: ['nickname'],
    },
  ],
})
export class Authors extends Model {
  declare id: number;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER })
  declare userId: number;

  @Column({ type: DataType.STRING(50) })
  declare nickname: string;

  @Column({ type: DataType.BOOLEAN })
  declare showOnlyNickname: boolean;

  @Column({ type: DataType.JSONB })
  declare images: string[];

  @Column({ type: DataType.STRING(150) })
  declare email: string;

  @Column({ type: DataType.STRING(50) })
  declare phone: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare status: boolean;

  @Column({ type: DataType.INTEGER })
  declare level: number;

  @BelongsTo(() => Users)
  declare user: Users;
}
