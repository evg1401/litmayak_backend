import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'publishing_houses' })
export class PublishingHouses extends Model {
  @Column({ type: DataType.STRING(255) })
  declare name: string;

  @Column({ type: DataType.STRING(10) })
  declare inn: string;

  @Column({ type: DataType.STRING(9) })
  declare kpp: string;

  @Column({ type: DataType.STRING(255) })
  declare legalAddress: string;

  @Column({ type: DataType.STRING(150) })
  declare email: string;

  @Column({ type: DataType.JSONB })
  declare images: string[];

  @Column({ type: DataType.STRING(50) })
  declare contactPhone: string;

  @Column({ type: DataType.STRING(256) })
  declare contactFullname: string;

  @Column({ type: DataType.BOOLEAN })
  declare status: boolean;

  @Column({ type: DataType.INTEGER })
  declare level: number;
}
