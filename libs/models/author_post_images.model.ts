import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { AuthorPosts } from './author_posts.model';
import { toMediaUrl } from 'configs/media.config';

@Table({
  tableName: 'author_post_images',
  indexes: [
    {
      name: 'author_post_images_post_id',
      fields: ['post_id'],
    },
  ],
})
export class AuthorPostImages extends Model {
  declare id: number;

  @ForeignKey(() => AuthorPosts)
  @Column({ type: DataType.INTEGER })
  declare postId: number;

  @Column({
    type: DataType.STRING(2048),
    get(this: AuthorPostImages) {
      return toMediaUrl(this.getDataValue('url'));
    },
  })
  declare url: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare order: number;

  @BelongsTo(() => AuthorPosts)
  declare post: AuthorPosts;
}
