import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Users } from './users.model';

@Table({ tableName: 'notification_settings' })
export class NotificationSettings extends Model {
  declare id: number;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER })
  declare userId: number;

  @Column({ type: DataType.STRING(64) })
  declare key: string;

  @Column({ type: DataType.BOOLEAN })
  declare enabled: boolean;

  @BelongsTo(() => Users)
  declare user: Users;
}
