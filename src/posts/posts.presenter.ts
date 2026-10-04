import {
  AuthorPostComments,
  AuthorPostImages,
  AuthorPosts,
  BookCharacters,
  Books,
} from '@models';

export type PostAttachmentType = 'book' | 'chapter' | 'series';

export interface PostAttachmentView {
  type: PostAttachmentType;
  title: string;
  subtitle: string;
}

export interface PostView {
  id: number;
  authorId: number;
  text: string | null;
  images: string[];
  attachment: PostAttachmentView | null;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  liked: boolean;
  reposted: boolean;
  createdAt: Date;
}

export interface PostAuthor {
  nickname: string;
  fullname: string | null;
  image: string | null;
}

export type PostWithAuthorView = PostView & { author: PostAuthor };

export interface PostCommentView {
  id: number;
  postId: number;
  userId: number;
  text: string;
  createdAt: Date;
}

export function presentPost(
  post: AuthorPosts,
  likedPostIds: ReadonlySet<number>,
  repostedPostIds: ReadonlySet<number>,
): PostView {
  let attachment: PostAttachmentView | null = null;

  if (post.attachmentType === 'book' && post.book) {
    attachment = {
      type: 'book',
      title: post.book.name,
      subtitle: 'Книга',
    };
  } else if (post.attachmentType === 'chapter' && post.bookCharacter) {
    attachment = {
      type: 'chapter',
      title: post.bookCharacter.name,
      subtitle: post.book?.name ?? '',
    };
  } else if (post.attachmentType === 'series' && post.seriesTitle) {
    attachment = { type: 'series', title: post.seriesTitle, subtitle: '' };
  }

  const images = [...(post.images ?? [])]
    .sort((a, b) => a.order - b.order)
    .map((image) => image.url);

  return {
    id: post.id,
    authorId: post.authorId,
    text: post.text,
    images,
    attachment,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    repostsCount: post.repostsCount,
    liked: likedPostIds.has(post.id),
    reposted: repostedPostIds.has(post.id),
    createdAt: post.createdAt,
  };
}

export function presentComment(comment: AuthorPostComments): PostCommentView {
  return {
    id: comment.id,
    postId: comment.postId,
    userId: comment.userId,
    text: comment.text,
    createdAt: comment.createdAt,
  };
}

export const postAttachmentIncludes = () => [
  { model: Books, attributes: ['id', 'name'] },
  { model: BookCharacters, attributes: ['id', 'name'] },
  { model: AuthorPostImages, attributes: ['url', 'order'] },
];
