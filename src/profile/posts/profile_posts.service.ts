import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  AuthorPostComments,
  AuthorPostImages,
  AuthorPostLikes,
  AuthorPostReposts,
  AuthorPosts,
  Authors,
  BookCharacters,
  Books,
} from '@models';
import {
  CreatePostCommentRequestDto,
  CreatePostRepostRequestDto,
  SavePostRequestDto,
} from './dto/posts.request.dto';
import {
  postAttachmentIncludes,
  presentComment,
  presentPost,
  PostCommentView,
  PostView,
} from '@/posts/posts.presenter';
import { PageList } from 'dto/response.dto';
import { getOffsetFromPage, normalizeOwnMediaKeys } from '@/helpers';

@Injectable()
export class ProfilePostsService {
  constructor(
    @InjectModel(AuthorPosts) protected postsRepository: typeof AuthorPosts,
    @InjectModel(AuthorPostLikes)
    protected likesRepository: typeof AuthorPostLikes,
    @InjectModel(AuthorPostReposts)
    protected repostsRepository: typeof AuthorPostReposts,
    @InjectModel(AuthorPostComments)
    protected commentsRepository: typeof AuthorPostComments,
    @InjectModel(Authors) protected authorsRepository: typeof Authors,
    @InjectModel(Books) protected booksRepository: typeof Books,
    @InjectModel(BookCharacters)
    protected bookCharactersRepository: typeof BookCharacters,
    @InjectModel(AuthorPostImages)
    protected imagesRepository: typeof AuthorPostImages,
  ) {}

  async create(userId: number, request: SavePostRequestDto): Promise<PostView> {
    if (
      !request.text?.trim() &&
      !request.attachmentType &&
      !request.images?.length
    ) {
      throw new Error(
        'Добавьте текст, вложение или изображение - пустой пост опубликовать нельзя',
      );
    }

    const author = await this.getAuthorByUserId(userId);
    await this.validateAttachment(request);

    const post = await this.postsRepository.create({
      authorId: author.id,
      text: request.text ?? null,
      attachmentType: request.attachmentType ?? null,
      bookId: request.attachmentType === 'book' ? request.bookId : null,
      bookCharacterId:
        request.attachmentType === 'chapter' ? request.bookCharacterId : null,
      seriesTitle:
        request.attachmentType === 'series' ? request.seriesTitle : null,
    });

    if (request.images?.length) {
      const keys = await normalizeOwnMediaKeys(userId, request.images);
      await this.imagesRepository.bulkCreate(
        keys.map((url, order) => ({ postId: post.id, url, order })),
      );
    }

    return this.getPresentedPost(post.id);
  }

  async update(
    userId: number,
    postId: number,
    request: SavePostRequestDto,
  ): Promise<PostView> {
    const author = await this.getAuthorByUserId(userId);
    const post = await this.getOwnPostOrThrow(author.id, postId);

    if (request.attachmentType !== undefined) {
      await this.validateAttachment(request);
    }

    await post.update({
      ...(request.text !== undefined ? { text: request.text } : {}),
      ...(request.attachmentType !== undefined
        ? {
            attachmentType: request.attachmentType,
            bookId: request.attachmentType === 'book' ? request.bookId : null,
            bookCharacterId:
              request.attachmentType === 'chapter'
                ? request.bookCharacterId
                : null,
            seriesTitle:
              request.attachmentType === 'series' ? request.seriesTitle : null,
          }
        : {}),
    });

    if (request.images !== undefined) {
      const keys = await normalizeOwnMediaKeys(userId, request.images);
      await this.imagesRepository.destroy({ where: { postId } });
      if (keys.length) {
        await this.imagesRepository.bulkCreate(
          keys.map((url, order) => ({ postId, url, order })),
        );
      }
    }

    return this.getPresentedPost(postId);
  }

  async delete(userId: number, postId: number): Promise<number> {
    const author = await this.getAuthorByUserId(userId);
    await this.getOwnPostOrThrow(author.id, postId);

    return this.postsRepository.destroy({ where: { id: postId } });
  }

  async like(userId: number, postId: number): Promise<void> {
    await this.getPostOrThrow(postId);

    const [, created] = await this.likesRepository.findOrCreate({
      where: { postId, userId },
      defaults: { postId, userId },
    });
    if (created) {
      await this.postsRepository.increment('likesCount', {
        where: { id: postId },
      });
    }
  }

  async unlike(userId: number, postId: number): Promise<void> {
    const deleted = await this.likesRepository.destroy({
      where: { postId, userId },
    });
    if (deleted > 0) {
      await this.postsRepository.decrement('likesCount', {
        where: { id: postId },
      });
    }
  }

  async repost(
    userId: number,
    postId: number,
    request: CreatePostRepostRequestDto,
  ): Promise<void> {
    const post = await this.getPostOrThrow(postId);
    const author = await this.authorsRepository.findByPk(post.authorId, {
      attributes: ['userId'],
    });
    if (author?.userId === userId) {
      throw new Error('Нельзя репостить собственный пост');
    }

    const [repost, created] = await this.repostsRepository.findOrCreate({
      where: { postId, userId },
      defaults: { postId, userId, comment: request.comment ?? null },
    });
    if (created) {
      await this.postsRepository.increment('repostsCount', {
        where: { id: postId },
      });
    } else if (request.comment !== undefined) {
      repost.comment = request.comment;
      await repost.save();
    }
  }

  async unrepost(userId: number, postId: number): Promise<void> {
    const deleted = await this.repostsRepository.destroy({
      where: { postId, userId },
    });
    if (deleted > 0) {
      await this.postsRepository.decrement('repostsCount', {
        where: { id: postId },
      });
    }
  }

  async addComment(
    userId: number,
    postId: number,
    request: CreatePostCommentRequestDto,
  ): Promise<PostCommentView> {
    await this.getPostOrThrow(postId);

    const comment = await this.commentsRepository.create({
      postId,
      userId,
      text: request.text,
    });
    await this.postsRepository.increment('commentsCount', {
      where: { id: postId },
    });

    return presentComment(comment);
  }

  async getOwnPosts(
    userId: number,
    page = 1,
    limit = 20,
  ): Promise<PageList<PostView>> {
    const author = await this.getAuthorByUserId(userId);

    const [total, posts] = await Promise.all([
      this.postsRepository.count({ where: { authorId: author.id } }),
      this.postsRepository.findAll({
        where: { authorId: author.id },
        offset: getOffsetFromPage(page, limit),
        limit,
        order: [['id', 'DESC']],
        include: postAttachmentIncludes(),
      }),
    ]);

    const [likedIds, repostedIds] = await this.getViewerMarks(
      posts.map((post) => post.id),
      userId,
    );

    return {
      count: posts.length,
      total,
      items: posts.map((post) => presentPost(post, likedIds, repostedIds)),
    };
  }

  private async getPresentedPost(postId: number): Promise<PostView> {
    const post = await this.postsRepository.findByPk(postId, {
      include: postAttachmentIncludes(),
    });

    return presentPost(post!, new Set(), new Set());
  }

  private async getAuthorByUserId(userId: number): Promise<Authors> {
    const author = await this.authorsRepository.findOne({ where: { userId } });
    if (!author) {
      throw new Error('пользователь не является автором');
    }
    return author;
  }

  private async getPostOrThrow(postId: number): Promise<AuthorPosts> {
    const post = await this.postsRepository.findByPk(postId);
    if (!post) throw new Error('пост не найден');
    return post;
  }

  private async getOwnPostOrThrow(
    authorId: number,
    postId: number,
  ): Promise<AuthorPosts> {
    const post = await this.postsRepository.findOne({
      where: { id: postId, authorId },
    });
    if (!post) throw new Error('пост не найден');
    return post;
  }

  private async validateAttachment(request: SavePostRequestDto): Promise<void> {
    if (request.attachmentType === 'book') {
      const exists = await this.booksRepository.findByPk(request.bookId);
      if (!exists) throw new Error('указанная книга не найдена');
    } else if (request.attachmentType === 'chapter') {
      const exists = await this.bookCharactersRepository.findByPk(
        request.bookCharacterId,
      );
      if (!exists) throw new Error('указанная глава не найдена');
    } else if (request.attachmentType === 'series' && !request.seriesTitle) {
      throw new Error('не указано название серии');
    }
  }

  private async getViewerMarks(
    postIds: number[],
    viewerUserId: number,
  ): Promise<[Set<number>, Set<number>]> {
    if (postIds.length === 0) return [new Set(), new Set()];

    const [likes, reposts] = await Promise.all([
      this.likesRepository.findAll({
        attributes: ['postId'],
        where: { userId: viewerUserId, postId: postIds },
      }),
      this.repostsRepository.findAll({
        attributes: ['postId'],
        where: { userId: viewerUserId, postId: postIds },
      }),
    ]);

    return [
      new Set(likes.map((like) => like.postId)),
      new Set(reposts.map((repost) => repost.postId)),
    ];
  }
}
