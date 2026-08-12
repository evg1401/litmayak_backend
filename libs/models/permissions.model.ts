import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'permissions' })
export class Permissions extends Model {
  declare id: number;

  @Column({ type: DataType.STRING })
  declare action: string;

  @Column({ type: DataType.STRING })
  declare subject: string;

  @Column({ type: DataType.STRING })
  declare fields: string;

  @Column({ type: DataType.STRING })
  declare conditions: string;

  @Column({ type: DataType.STRING })
  declare type: string;

  @Column({ type: DataType.STRING })
  declare title: string;

  // @BelongsToMany(() => Users, () => Roles)
  // declare users: Users[];
}
