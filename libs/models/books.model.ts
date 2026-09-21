import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { Authors } from './authors.model';
import { PublishingHouses } from './publishing_houses.model';
import { BookReviews } from '@models';

@Table({ tableName: 'books' })
export class Books extends Model {
  declare id: number;

  @ForeignKey(() => Authors)
  @Column({ type: DataType.INTEGER })
  declare authorId: number;

  @ForeignKey(() => PublishingHouses)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  declare publishingHouseId: number | null;

  @Column({ type: DataType.STRING(256) })
  declare name: string;

  @Column({ type: DataType.JSONB })
  declare images: string[];

  @Column({ type: DataType.STRING(256) })
  declare uid: string;

  @Column({ type: DataType.STRING(256) })
  declare year: string;

  @Column({ type: DataType.STRING(256) })
  declare slug: string;

  @Column({ type: DataType.TEXT })
  declare description: string;

  @Column({ type: DataType.STRING(50) })
  declare language: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare status: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare checkStatus: boolean;

  @Column({ type: DataType.INTEGER })
  declare score: number;

  @BelongsTo(() => Authors)
  declare author: Authors;

  @BelongsTo(() => PublishingHouses)
  declare publishingHouse: PublishingHouses;

  @HasOne(() => BookReviews, {
    foreignKey: 'bookId',
  })
  declare review: BookReviews;
}
