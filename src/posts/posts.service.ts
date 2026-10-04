import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  AuthorPostComments,
  AuthorPostLikes,
  AuthorPostReposts,
  AuthorPosts,
  Authors,
} from '@models';
import { getOffsetFromPage } from '@/helpers';
import { PageList } from 'dto/response.dto';
import {
  postAttachmentIncludes,
  presentComment,
  presentPost,
  PostCommentView,
  PostView,
  PostWithAuthorView,
} from './posts.presenter';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(AuthorPosts) protected postsRepository: typeof AuthorPosts,
    @InjectModel(AuthorPostLikes)
    protected likesRepository: typeof AuthorPostLikes,
    @InjectModel(AuthorPostReposts)
    protected repostsRepository: typeof AuthorPostReposts,
    @InjectModel(AuthorPostComments)
    protected commentsRepository: typeof AuthorPostComments,
    @InjectModel(Authors) protected authorsRepository: typeof Authors,
  ) {}

  async getAuthorPosts(
    nickname: string,
    page = 1,
    limit = 20,
    viewerUserId?: number,
  ): Promise<PageList<PostView>> {
    const author = await this.authorsRepository.findOne({
      attributes: ['id'],
      where: { nickname },
    });
    if (!author) return { count: 0, total: 0, items: [] };

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
      viewerUserId,
    );

    return {
      count: posts.length,
      total,
      items: posts.map((post) => presentPost(post, likedIds, repostedIds)),
    };
  }

  async getLatestPosts(
    limit = 10,
    viewerUserId?: number,
  ): Promise<PostWithAuthorView[]> {
    const posts = await this.postsRepository.findAll({
      limit,
      order: [['id', 'DESC']],
      include: [
        ...postAttachmentIncludes(),
        {
          association: 'author',
          attributes: ['nickname', 'showOnlyNickname', 'images'],
          include: [{ association: 'user', attributes: ['fullname'] }],
        },
      ],
    });

    const [likedIds, repostedIds] = await this.getViewerMarks(
      posts.map((post) => post.id),
      viewerUserId,
    );

    return posts.map((post) => ({
      ...presentPost(post, likedIds, repostedIds),
      author: {
        nickname: post.author.nickname,
        fullname: post.author.showOnlyNickname
          ? null
          : (post.author.user?.fullname ?? null),
        image: post.author.images?.[0] ?? null,
      },
    }));
  }

  async getPostComments(
    nickname: string,
    postId: number,
    page = 1,
    limit = 50,
  ): Promise<PageList<PostCommentView>> {
    const post = await this.findAuthorPost(nickname, postId);
    if (!post) return { count: 0, total: 0, items: [] };

    const [total, comments] = await Promise.all([
      this.commentsRepository.count({ where: { postId } }),
      this.commentsRepository.findAll({
        where: { postId },
        offset: getOffsetFromPage(page, limit),
        limit,
        order: [['id', 'ASC']],
      }),
    ]);

    return {
      count: comments.length,
      total,
      items: comments.map(presentComment),
    };
  }

  private async findAuthorPost(
    nickname: string,
    postId: number,
  ): Promise<AuthorPosts | null> {
    const author = await this.authorsRepository.findOne({
      attributes: ['id'],
      where: { nickname },
    });
    if (!author) return null;

    return this.postsRepository.findOne({
      where: { id: postId, authorId: author.id },
    });
  }

  private async getViewerMarks(
    postIds: number[],
    viewerUserId?: number,
  ): Promise<[Set<number>, Set<number>]> {
    if (!viewerUserId || postIds.length === 0) {
      return [new Set(), new Set()];
    }

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
