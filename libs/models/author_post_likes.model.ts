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
  tableName: 'author_post_likes',
  indexes: [
    {
      name: 'author_post_likes_post_id_user_id_uniq',
      unique: true,
      fields: ['post_id', 'user_id'],
    },
  ],
})
export class AuthorPostLikes extends Model {
  declare id: number;

  @ForeignKey(() => AuthorPosts)
  @Column({ type: DataType.INTEGER })
  declare postId: number;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER })
  declare userId: number;

  @BelongsTo(() => AuthorPosts)
  declare post: AuthorPosts;

  @BelongsTo(() => Users)
  declare user: Users;
}
