import { MagazineArticles } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import slugConverter from 'slug';
import { toMediaKey } from 'configs/media.config';
import { SaveMagazineArticleRequestDto } from './dto/magazine_articles.request.dto';

const SLUG_MAX_LENGTH = 160;

@Injectable()
export class MagazineArticlesService {
  constructor(
    @InjectModel(MagazineArticles) protected model: typeof MagazineArticles,
  ) {}

  async getList(section?: 'journal' | 'legal'): Promise<MagazineArticles[]> {
    return this.model.findAll({
      where: section ? { section } : {},
      order: [['createdAt', 'DESC']],
    });
  }

  async create(
    userId: number,
    request: SaveMagazineArticleRequestDto,
  ): Promise<MagazineArticles> {
    const slug = await this.ensureUniqueSlug(request.slug || request.title);
    return this.model.create({
      section: request.section,
      title: request.title,
      slug,
      description: request.description ?? null,
      category: request.category ?? null,
      coverUrl: request.coverUrl ? toMediaKey(request.coverUrl) : null,
      html: request.html ?? '',
      isPublished: request.isPublished ?? false,
      authorId: userId,
    });
  }

  async update(
    id: number,
    request: SaveMagazineArticleRequestDto,
  ): Promise<MagazineArticles> {
    const row = await this.model.findByPk(id);
    if (!row) throw new Error('статья не найдена');

    const slug =
      request.slug && request.slug !== row.slug
        ? await this.ensureUniqueSlug(request.slug, id)
        : row.slug;

    row.section = request.section;
    row.title = request.title;
    row.slug = slug;
    row.description = request.description ?? null;
    row.category = request.category ?? null;
    row.coverUrl = request.coverUrl ? toMediaKey(request.coverUrl) : null;
    row.html = request.html ?? '';
    row.isPublished = request.isPublished ?? false;
    await row.save();

    return row;
  }

  async delete(id: number): Promise<number> {
    return this.model.destroy({ where: { id } });
  }

  private async ensureUniqueSlug(
    source: string,
    excludeId?: number,
  ): Promise<string> {
    const base =
      slugConverter(source, { locale: 'ru', lower: true }).slice(
        0,
        SLUG_MAX_LENGTH - 4,
      ) || 'article';

    let candidate = base;
    let suffix = 1;

    while (
      await this.model
        .findOne({
          attributes: ['id'],
          where: { slug: candidate },
        })
        .then((existing) => existing && existing.id !== excludeId)
    ) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }

    return candidate;
  }
}
