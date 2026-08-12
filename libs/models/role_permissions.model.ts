import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Permissions } from './permissions.model';
import { Roles } from './roles.model';

@Table({ tableName: 'role_permissions' })
export class RolePermissions extends Model {
  declare id: number;

  @ForeignKey(() => Roles)
  @Column({ type: DataType.INTEGER })
  declare roleId: number;

  @ForeignKey(() => Permissions)
  @Column({ type: DataType.INTEGER })
  declare permissionId: number;

  @BelongsTo(() => Permissions)
  declare permission: Permissions;

  @BelongsTo(() => Roles)
  declare role: Roles;
}
