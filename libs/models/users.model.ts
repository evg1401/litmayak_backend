import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { Roles } from './roles.model';

@Table({ tableName: 'users' })
export class Users extends Model {
  declare id: number;

  @ForeignKey(() => Roles)
  @Column({ type: DataType.INTEGER })
  declare roleId: number;

  @Column({ type: DataType.INTEGER })
  declare level: number;

  @Column({ type: DataType.STRING(256) })
  declare fullname: string;

  @Index({ unique: true })
  @Column({ type: DataType.STRING(50) })
  declare phone: string;

  @Column({ type: DataType.STRING(150) })
  declare email: string;

  @Column({ type: DataType.BOOLEAN })
  declare status: boolean;

  // @BelongsToMany(() => Permissions, () => RolePermissions)
  // declare permissions: Permissions[];

  @BelongsTo(() => Roles)
  declare role: Roles;
}
