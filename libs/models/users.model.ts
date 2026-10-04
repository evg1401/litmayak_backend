import {
  BeforeBulkUpdate,
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { Roles } from './roles.model';
import { UserStatus } from '@/common/constants/user_status.constants';
import { toMediaUrl } from 'configs/media.config';

@Table({
  tableName: 'users',
  indexes: [
    {
      name: 'users_personal_id_uniq',
      unique: true,
      fields: ['personal_id'],
    },
  ],
})
export class Users extends Model {
  declare id: number;

  @ForeignKey(() => Roles)
  @Column({ type: DataType.INTEGER })
  declare roleId: number;

  @Column({ type: DataType.STRING(256) })
  declare personalId: string | null;

  @Column({ type: DataType.INTEGER })
  declare level: number;

  @Column({ type: DataType.STRING(256) })
  declare fullname: string;

  @Index({ unique: true })
  @Column({ type: DataType.STRING(50) })
  declare phone: string;

  @Column({ type: DataType.STRING(150) })
  declare email: string;

  @Index({ unique: true })
  @Column({ type: DataType.STRING(50) })
  declare nickname: string;

  @Column({ type: DataType.STRING(20), defaultValue: UserStatus.New })
  declare status: UserStatus;

  @Column({
    type: DataType.STRING(256),
    get(this: Users) {
      return toMediaUrl(this.getDataValue('avatar'));
    },
  })
  declare avatar: string | null;

  @Column({ type: DataType.JSONB })
  declare additionalFields: any;

  @BelongsTo(() => Roles)
  declare role: Roles;

  @BeforeUpdate
  static preventPersonalIdChange(instance: Users): void {
    if (instance.changed('personalId') && instance.previous('personalId')) {
      throw new Error('personal_id пользователя не может быть изменён');
    }
  }

  @BeforeBulkUpdate
  static stripPersonalIdOnBulkUpdate(options: {
    attributes?: Record<string, unknown>;
    fields?: string[];
  }): void {
    if (options.attributes) delete options.attributes.personalId;
    if (options.fields) {
      options.fields = options.fields.filter((f) => f !== 'personalId');
    }
  }
}
