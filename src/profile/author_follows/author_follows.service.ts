import { AuthorFollows, Authors } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  AuthorsService,
  PublicAuthorInfo,
} from '@/authors/authors.service';

@Injectable()
export class AuthorFollowsService {
  constructor(
    @InjectModel(AuthorFollows) protected model: typeof AuthorFollows,
    @InjectModel(Authors) protected authorsRepository: typeof Authors,
    private readonly authorsService: AuthorsService,
  ) {}

  async follow(userId: number, authorId: number): Promise<void> {
    const author = await this.authorsRepository.findByPk(authorId, {
      attributes: ['id'],
    });
    if (!author) throw new Error('автор не найден');

    const existing = await this.model.findOne({ where: { userId, authorId } });
    if (existing) return;

    await this.model.create({ userId, authorId });
  }

  async unfollow(userId: number, authorId: number): Promise<void> {
    await this.model.destroy({ where: { userId, authorId } });
  }

  async getFollowedAuthorIds(userId: number): Promise<number[]> {
    const rows = await this.model.findAll({
      where: { userId },
      attributes: ['authorId'],
    });
    return rows.map((r) => r.authorId);
  }

  async getFollowedAuthorsInfo(userId: number): Promise<PublicAuthorInfo[]> {
    const rows = await this.model.findAll({
      where: { userId },
      attributes: ['authorId'],
      order: [['id', 'DESC']],
    });
    return this.authorsService.getAuthorsByIds(rows.map((r) => r.authorId));
  }
}
