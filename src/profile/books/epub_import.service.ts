import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Authors, Books, BookCharacters } from '@models';
import type { EpubFile, EpubSpine, EpubToc } from '@lingo-reader/epub-parser';
import { readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { resolveInsideDir, sanitizeHtml } from '@/helpers';

const importEpubParser = async (): Promise<{
  initEpubFile: typeof import('@lingo-reader/epub-parser').initEpubFile;
}> => import('@lingo-reader/epub-parser');

interface ChapterRange {
  title: string;
  spineIds: string[];
}

export interface EpubImportResult {
  book: Books;
  chaptersCreated: number;
}

export interface EpubMetadataPreview {
  title: string | null;
  description: string | null;
  language: string | null;
  year: string | null;
  tags: string[];
  cover: string | null;
}

// mime изображений, которые могут встретиться в epub
const IMAGE_MIME_BY_EXT: Readonly<Record<string, string>> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

const RESOURCE_WRITE_DELAY_MS = 300;

@Injectable()
export class EpubImportService {
  constructor(
    @InjectModel(Books) protected booksRepository: typeof Books,
    @InjectModel(BookCharacters)
    protected charactersRepository: typeof BookCharacters,
    @InjectModel(Authors) protected authorsRepository: typeof Authors,
  ) {}

  async importEpub(
    userId: number,
    bookId: number,
    epubPath: string,
  ): Promise<EpubImportResult> {
    const author = await this.authorsRepository.findOne({
      where: { userId },
    });
    if (!author) throw new Error('вы не являетесь автором');

    const book = await this.booksRepository.findOne({
      where: { id: bookId, authorId: author.id },
    });
    if (!book) throw new Error('книга не найдена');

    const resourceDir = join(tmpdir(), `epub-import-${randomUUID()}`);
    const { initEpubFile } = await importEpubParser();
    const epub = await initEpubFile(epubPath, resourceDir);

    try {
      const metadata = epub.getMetadata();
      const ranges = this.buildChapterRanges(epub.getSpine(), epub.getToc());

      const rawContents: string[] = [];
      for (const range of ranges) {
        const parts: string[] = [];
        for (const spineId of range.spineIds) {
          try {
            const { html } = await epub.loadChapter(spineId);
            parts.push(html);
          } catch {
            // пропуск нечитаемой главы
          }
        }
        rawContents.push(parts.join('\n'));
      }

      const cover = await this.extractCover(epub, resourceDir);

      await this.wait(RESOURCE_WRITE_DELAY_MS);
      const contents = await Promise.all(
        rawContents.map(async (html) =>
          sanitizeHtml(await this.inlineResourceImages(html, resourceDir)),
        ),
      );

      const existingCount = await this.charactersRepository.count({
        where: { bookId: book.id },
      });
      const existingNames = new Set(
        (
          await this.charactersRepository.findAll({
            where: { bookId: book.id },
            attributes: ['name'],
          })
        ).map((c) => c.name),
      );

      const rows = ranges.map((range, i) => {
        const name = this.uniqueName(range.title, existingNames);
        existingNames.add(name);
        return {
          bookId: book.id,
          name,
          status: false,
          order: existingCount + i + 1,
          xhtml: contents[i] || null,
        };
      });

      if (rows.length) {
        await this.charactersRepository.bulkCreate(rows);
      }

      const updates: Record<string, unknown> = {};
      if (metadata.title) updates.name = metadata.title.trim();
      if (metadata.description)
        updates.description = metadata.description.trim();
      if (metadata.language) updates.language = metadata.language;
      if (cover) {

        const existingImages = (
          (book.getDataValue('images') as string[] | null) ?? []
        ).filter((i) => i !== cover);
        updates.images = [cover, ...existingImages];
      }

      if (Object.keys(updates).length) {
        await book.update(updates);
      }

      return { book, chaptersCreated: rows.length };
    } finally {
      epub.destroy();
      await rm(resourceDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  async parseMetadataOnly(epubPath: string): Promise<EpubMetadataPreview> {
    const resourceDir = join(tmpdir(), `epub-preview-${randomUUID()}`);
    const { initEpubFile } = await importEpubParser();
    const epub = await initEpubFile(epubPath, resourceDir);

    try {
      const metadata = epub.getMetadata();
      const cover = await this.extractCover(epub, resourceDir);
      const year =
        metadata.date?.publication ??
        Object.values(metadata.date ?? {})[0] ??
        null;

      return {
        title: metadata.title?.trim() || null,
        description: metadata.description?.trim() || null,
        language: metadata.language || null,
        year,
        tags: (metadata.subject ?? [])
          .map((s) => s.subject?.trim())
          .filter((s): s is string => !!s),
        cover,
      };
    } finally {
      epub.destroy();
      await rm(resourceDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  private uniqueName(base: string, existing: Set<string>): string {
    const trimmedBase = (base || 'Глава').slice(0, 250);
    let name = trimmedBase;
    let suffix = 1;
    while (existing.has(name)) {
      suffix += 1;
      name = `${trimmedBase} (${suffix})`.slice(0, 255);
    }
    return name;
  }

  private buildChapterRanges(spine: EpubSpine, toc: EpubToc): ChapterRange[] {
    const linearSpine = spine.filter((s) => s.linear !== 'no');
    const idToIndex = new Map(linearSpine.map((s, i) => [s.id, i]));

    const flatToc: { label: string; id: string }[] = [];
    const walk = (entries: EpubToc) => {
      for (const entry of entries) {
        flatToc.push({ label: entry.label, id: entry.id });
        if (entry.children?.length) walk(entry.children);
      }
    };
    walk(toc ?? []);

    const seen = new Set<number>();
    const points = flatToc
      .map((entry) => ({ label: entry.label, index: idToIndex.get(entry.id) }))
      .filter(
        (entry): entry is { label: string; index: number } =>
          entry.index !== undefined,
      )
      .filter((entry) => {
        if (seen.has(entry.index)) return false;
        seen.add(entry.index);
        return true;
      })
      .sort((a, b) => a.index - b.index);

    if (!points.length) {
      return linearSpine.map((item, i) => ({
        title: `Глава ${i + 1}`,
        spineIds: [item.id],
      }));
    }

    return points.map((point, i) => {
      const end =
        i + 1 < points.length ? points[i + 1].index : linearSpine.length;
      return {
        title: point.label.trim() || `Глава ${i + 1}`,
        spineIds: linearSpine.slice(point.index, end).map((s) => s.id),
      };
    });
  }

  private async extractCover(
    epub: EpubFile,
    resourceDir: string,
  ): Promise<string | null> {
    try {
      const direct = epub.getCoverImage();
      if (direct) {
        await this.wait(RESOURCE_WRITE_DELAY_MS);
        return await this.fileToDataUri(direct, resourceDir);
      }

      const coverSpineItem = epub.getSpine().find((s) => /cover/i.test(s.id));
      if (!coverSpineItem) return null;

      const { html } = await epub.loadChapter(coverSpineItem.id);
      const match = html.match(/src="([^"]+)"/);
      if (!match) return null;

      await this.wait(RESOURCE_WRITE_DELAY_MS);
      return await this.fileToDataUri(match[1], resourceDir);
    } catch {
      return null;
    }
  }

  private async fileToDataUri(
    filePath: string,
    resourceDir: string,
  ): Promise<string | null> {
    // путь берётся из html внутри epub
    const safePath = await resolveInsideDir(filePath, resourceDir);
    if (!safePath) return null;

    try {
      const data = await readFile(safePath);
      const mime =
        IMAGE_MIME_BY_EXT[extname(filePath).toLowerCase()] ?? 'image/jpeg';
      return `data:${mime};base64,${data.toString('base64')}`;
    } catch {
      return null;
    }
  }

  private async inlineResourceImages(
    html: string,
    resourceDir: string,
  ): Promise<string> {
    const srcPaths = new Set(
      [...html.matchAll(/src="([^"]*)"/g)]
        .map(([, src]) => src)
        .filter((src) => src.startsWith(resourceDir)),
    );

    let result = html;
    for (const filePath of srcPaths) {
      const dataUri = await this.fileToDataUri(filePath, resourceDir);
      if (dataUri) {
        result = result.split(`src="${filePath}"`).join(`src="${dataUri}"`);
      }
    }
    return result;
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
