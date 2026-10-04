import { Authors, AuthorFollows, Books } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col, fn } from 'sequelize';

export interface PopularAuthorItem {
  id: number;
  nickname: string;
  fullname: string | null;
  image: string | null;
  booksCount: number;
}

export interface PublicAuthorProfile {
  id: number;
  nickname: string;
  fullname: string | null;
  image: string | null;
  bio: string | null;
  booksCount: number;
  followersCount: number;
  followingCount: number;
}

export interface PublicAuthorInfo {
  id: number;
  nickname: string;
  fullname: string | null;
  image: string | null;
  bio: string | null;
  genres: string[];
  booksCount: number;
  followersCount: number;
}

type AdditionalFields = { bio?: unknown; genres?: unknown };

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel(Authors) protected authorsRepository: typeof Authors,
    @InjectModel(Books) protected booksRepository: typeof Books,
    @InjectModel(AuthorFollows)
    protected authorFollowsRepository: typeof AuthorFollows,
  ) {}

  async getProfile(nickname: string): Promise<PublicAuthorProfile | null> {
    const author = await this.authorsRepository.findOne({
      where: { nickname },
      attributes: ['id', 'userId', 'nickname', 'showOnlyNickname', 'images'],
      include: [
        { association: 'user', attributes: ['fullname', 'additionalFields'] },
      ],
    });
    if (!author) return null;

    const [booksCount, followersCount, followingCount] = await Promise.all([
      this.booksRepository.count({
        where: { authorId: author.id, status: true },
      }),
      this.authorFollowsRepository.count({ where: { authorId: author.id } }),
      this.authorFollowsRepository.count({
        where: { userId: author.userId },
      }),
    ]);

    const additional = (author.user?.additionalFields ?? {}) as AdditionalFields;

    return {
      id: author.id,
      nickname: author.nickname,
      fullname: author.showOnlyNickname
        ? null
        : (author.user?.fullname ?? null),
      image: author.images?.[0] ?? null,
      bio: typeof additional.bio === 'string' ? additional.bio : null,
      booksCount,
      followersCount,
      followingCount,
    };
  }

  async getPopularAuthors(
    limit: number,
    sortBy: 'books' | 'followers' = 'books',
  ): Promise<PopularAuthorItem[]> {
    const counts =
      sortBy === 'followers'
        ? await this.countAuthorFollows(limit)
        : await this.countAuthorBooks(limit);

    if (!counts.length) return [];

    const authors = await this.authorsRepository.findAll({
      where: { id: counts.map((c) => c.authorId) },
      attributes: ['id', 'nickname', 'showOnlyNickname', 'images'],
      include: [{ association: 'user', attributes: ['fullname'] }],
    });
    const byId = new Map(authors.map((a) => [a.id, a]));

    return counts
      .map((c): PopularAuthorItem | null => {
        const author = byId.get(c.authorId);
        if (!author) return null;
        return {
          id: author.id,
          nickname: author.nickname,
          fullname: author.showOnlyNickname
            ? null
            : (author.user?.fullname ?? null),
          image: author.images?.[0] ?? null,
          booksCount: Number(c.count),
        };
      })
      .filter((a): a is PopularAuthorItem => a !== null);
  }

  async getNewestAuthors(limit: number): Promise<PublicAuthorInfo[]> {
    const authors = await this.authorsRepository.findAll({
      order: [['createdAt', 'DESC']],
      limit,
      attributes: ['id', 'nickname', 'showOnlyNickname', 'images'],
      include: [{ association: 'user', attributes: ['fullname', 'additionalFields'] }],
    });
    return this.toAuthorInfoList(authors);
  }

  async getAuthorsByIds(ids: number[]): Promise<PublicAuthorInfo[]> {
    if (!ids.length) return [];
    const authors = await this.authorsRepository.findAll({
      where: { id: ids },
      attributes: ['id', 'nickname', 'showOnlyNickname', 'images'],
      include: [{ association: 'user', attributes: ['fullname', 'additionalFields'] }],
    });

    const byId = new Map(authors.map((a) => [a.id, a]));
    const ordered = ids.map((id) => byId.get(id)).filter((a): a is Authors => !!a);
    return this.toAuthorInfoList(ordered);
  }

  private async toAuthorInfoList(authors: Authors[]): Promise<PublicAuthorInfo[]> {
    if (!authors.length) return [];
    const ids = authors.map((a) => a.id);

    const [bookCounts, followerCounts] = await Promise.all([
      this.countAuthorBooks(ids.length, ids),
      this.countAuthorFollows(ids.length, ids),
    ]);
    const bookById = new Map(bookCounts.map((c) => [c.authorId, c.count]));
    const followerById = new Map(followerCounts.map((c) => [c.authorId, c.count]));

    return authors.map((author) => {
      const additional = (author.user?.additionalFields ?? {}) as AdditionalFields;
      return {
        id: author.id,
        nickname: author.nickname,
        fullname: author.showOnlyNickname
          ? null
          : (author.user?.fullname ?? null),
        image: author.images?.[0] ?? null,
        bio: typeof additional.bio === 'string' ? additional.bio : null,
        genres: Array.isArray(additional.genres)
          ? additional.genres.filter((g): g is string => typeof g === 'string')
          : [],
        booksCount: Number(bookById.get(author.id) ?? 0),
        followersCount: Number(followerById.get(author.id) ?? 0),
      };
    });
  }

  private async countAuthorBooks(
    limit: number,
    authorIds?: number[],
  ): Promise<{ authorId: number; count: number }[]> {
    const rows = (await this.booksRepository.findAll({
      attributes: ['authorId', [fn('COUNT', col('id')), 'count']],
      where: authorIds ? { authorId: authorIds, status: true } : { status: true },
      group: ['authorId'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit,
      raw: true,
    })) as unknown as { authorId: number; count: string }[];
    return rows.map((r) => ({ authorId: r.authorId, count: Number(r.count) }));
  }

  private async countAuthorFollows(
    limit: number,
    authorIds?: number[],
  ): Promise<{ authorId: number; count: number }[]> {
    const rows = (await this.authorFollowsRepository.findAll({
      attributes: ['authorId', [fn('COUNT', col('id')), 'count']],
      where: authorIds ? { authorId: authorIds } : undefined,
      group: ['authorId'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit,
      raw: true,
    })) as unknown as { authorId: number; count: string }[];
    return rows.map((r) => ({ authorId: r.authorId, count: Number(r.count) }));
  }
}
