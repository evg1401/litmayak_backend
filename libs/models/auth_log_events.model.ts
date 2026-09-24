import { Column, DataType, Index, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'auth_code_events',
  indexes: [
    {
      name: 'auth_code_events_device_uid',
      fields: ['device_uid'],
    },
    {
      name: 'auth_code_events_phone',
      fields: ['phone'],
    },
    {
      name: 'auth_code_events_notify_type',
      fields: ['notify_type'],
    },
  ],
})
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
