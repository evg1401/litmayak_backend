import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { AuthorPosts } from './author_posts.model';
import { Users } from './users.model';

@Table({
  tableName: 'author_post_comments',
  indexes: [
    {
      name: 'author_post_comments_post_id',
      fields: ['post_id'],
    },
  ],
})
export class AuthorPostComments extends Model {
  declare id: number;

  @ForeignKey(() => AuthorPosts)
  @Column({ type: DataType.INTEGER })
  declare postId: number;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER })
  declare userId: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare text: string;

  @BelongsTo(() => AuthorPosts)
  declare post: AuthorPosts;

  @BelongsTo(() => Users)
  declare user: Users;
}
