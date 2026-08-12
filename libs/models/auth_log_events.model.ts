import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'auth_code_events' })
export class AuthCodeEvents extends Model {
  declare id: number;

  @Column({ type: DataType.STRING(50) })
  declare deviceUid: string;

  @Column({ type: DataType.STRING(50) })
  declare phone: string;

  @Column({ type: DataType.STRING(50) })
  declare notifyType: string;

  @Column({ type: DataType.STRING(50) })
  declare eventType: string;

  @Column({ type: DataType.STRING(50) })
  declare status: string;

  @Column({ type: DataType.STRING })
  declare errorMessage: string;
}
