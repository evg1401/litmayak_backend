import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { Users } from './users.model';
import { toMediaUrl } from 'configs/media.config';

export type MagazineArticleSection = 'journal' | 'legal';

@Table({ tableName: 'magazine_articles' })
export class MagazineArticles extends Model {
  declare id: number;

  @Index
  @Column({ type: DataType.STRING(20) })
  declare section: MagazineArticleSection;

  @Column({ type: DataType.STRING(255) })
  declare title: string;

  @Index({ unique: true })
  @Column({ type: DataType.STRING(160) })
  declare slug: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string | null;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare category: string | null;

  @Column({
    type: DataType.STRING(2048),
    allowNull: true,
    get(this: MagazineArticles) {
      return toMediaUrl(this.getDataValue('coverUrl'));
    },
  })
  declare coverUrl: string | null;

  @Column({ type: DataType.TEXT, defaultValue: '' })
  declare html: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare isPublished: boolean;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare readCount: number;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare authorId: number | null;

  @BelongsTo(() => Users)
  declare author: Users;
}
