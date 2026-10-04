import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Users } from './users.model';

@Table({ tableName: 'reading_settings' })
export class ReadingSettings extends Model {
  declare id: number;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER, unique: true })
  declare userId: number;

  @Column({ type: DataType.INTEGER, defaultValue: 18 })
  declare fontSize: number;

  @Column({ type: DataType.DECIMAL(3, 1), defaultValue: 1.8 })
  declare lineHeight: number;

  @Column({ type: DataType.STRING(20), defaultValue: 'georgia' })
  declare fontFamily: string;

  @Column({ type: DataType.STRING(20), defaultValue: 'light' })
  declare theme: string;

  @Column({ type: DataType.STRING(20), defaultValue: 'medium' })
  declare margin: string;

  @Column({ type: DataType.STRING(20), defaultValue: 'scroll' })
  declare scrollMode: string;

  @BelongsTo(() => Users)
  declare user: Users;
}
