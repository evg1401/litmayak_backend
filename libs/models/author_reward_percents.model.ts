import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Authors } from './authors.model';

@Table({ tableName: 'author_reward_percents' })
export class AuthorRewardPercents extends Model {
  declare id: number;

  @ForeignKey(() => Authors)
  @Column({ type: DataType.INTEGER })
  declare authorId: number;

  @Column({ type: DataType.FLOAT })
  declare percent: number;

  @Column({ type: DataType.DATE })
  declare timeStart: number;

  @Column({ type: DataType.DATE })
  declare timeEnd: number;

  @BelongsTo(() => Authors)
  declare book: Authors;
}
