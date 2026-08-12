import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { Permissions } from './permissions.model';
import { RolePermissions } from './role_permissions.model';

@Table({ tableName: 'roles', timestamps: false })
export class Roles extends Model {
  declare id: number;

  @Column({ type: DataType.STRING(50) })
  declare code: string;

  @Column({ type: DataType.STRING(50) })
  declare title: string;

  @BelongsToMany(() => Permissions, () => RolePermissions)
  declare permissions: Permissions[];
}
