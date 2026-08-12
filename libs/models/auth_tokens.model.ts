import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Users } from './users.model';

@Table({ tableName: 'auth_tokens' })
export class AuthTokens extends Model {
  declare id: number;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER })
  declare userId: number;

  @Column({ type: DataType.TEXT, defaultValue: '' })
  declare refreshToken: string;

  @Column({ type: DataType.STRING(50), defaultValue: '' })
  declare deviceUid: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare code: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare attemptCount: number;

  @Column({ type: DataType.DATE })
  declare codeCreatedAt: number;
}
