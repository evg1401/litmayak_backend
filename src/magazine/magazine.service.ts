import { MagazineArticles, MagazineArticleSection } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

export interface MagazineArticleSummaryView {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  coverUrl: string | null;
  readCount: number;
}

export interface MagazineArticleDetailView extends MagazineArticleSummaryView {
  html: string;
}

function presentSummary(row: MagazineArticles): MagazineArticleSummaryView {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    coverUrl: row.coverUrl,
    readCount: row.readCount,
  };
}

@Injectable()
export class MagazineService {
  constructor(
    @InjectModel(MagazineArticles) protected model: typeof MagazineArticles,
  ) {}

  async getList(
    section: MagazineArticleSection,
    category?: string,
  ): Promise<MagazineArticleSummaryView[]> {
    const where: Record<string, unknown> = { section, isPublished: true };
    if (category) where.category = category;

    const rows = await this.model.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    return rows.map(presentSummary);
  }

  async getBySlug(
    section: MagazineArticleSection,
    slug: string,
  ): Promise<MagazineArticleDetailView | null> {
    const row = await this.model.findOne({
      where: { section, slug, isPublished: true },
    });
    if (!row) return null;

    row.increment('readCount').catch(() => {});

    return { ...presentSummary(row), html: row.html };
  }
}
