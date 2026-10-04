import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Authors } from './authors.model';
import { Books } from './books.model';
import { BookCharacters } from './book_characters.model';
import { AuthorPostImages } from './author_post_images.model';

export type AuthorPostAttachmentType = 'book' | 'chapter' | 'series';

@Table({
  tableName: 'author_posts',
  indexes: [
    {
      name: 'author_posts_author_id',
      fields: ['author_id'],
    },
  ],
})
export class AuthorPosts extends Model {
  declare id: number;

  @ForeignKey(() => Authors)
  @Column({ type: DataType.INTEGER })
  declare authorId: number;

  @Column({ type: DataType.TEXT })
  declare text: string;

  @Column({ type: DataType.STRING(20) })
  declare attachmentType: AuthorPostAttachmentType | null;

  @ForeignKey(() => Books)
  @Column({ type: DataType.INTEGER })
  declare bookId: number | null;

  @ForeignKey(() => BookCharacters)
  @Column({ type: DataType.INTEGER })
  declare bookCharacterId: number | null;

  @Column({ type: DataType.STRING(255) })
  declare seriesTitle: string | null;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare likesCount: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare commentsCount: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare repostsCount: number;

  @BelongsTo(() => Authors)
  declare author: Authors;

  @BelongsTo(() => Books)
  declare book: Books;

  @BelongsTo(() => BookCharacters)
  declare bookCharacter: BookCharacters;

  @HasMany(() => AuthorPostImages)
  declare images: AuthorPostImages[];
}
