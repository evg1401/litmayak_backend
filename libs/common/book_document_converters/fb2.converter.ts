import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { readFile, rm } from 'node:fs/promises';
import { extname, join } from 'node:path';
import type { initFb2File as InitFb2File } from '@lingo-reader/fb2-parser';
import { FB2_DOC_EXT, FB2_DOC_MIME_TYPES } from './constants';
import { DocumentConverter } from './document_converter.interface';
import { internalLinkToAnchor, sanitizeChapterHtml } from './sanitize_html';

const FB2_LINK_PREFIX = 'fb2:';

const importFb2Parser = async (): Promise<{
  initFb2File: typeof InitFb2File;
}> => import('@lingo-reader/fb2-parser');

// mime изображений, которые парсер fb2 может извлечь
const IMAGE_MIME_BY_EXT: Readonly<Record<string, string>> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

// поскольку fb2-parser сохраняет изображения главы отдельными файлами в resourceDir и подставляет в html абсолютный путь к файлу вместо src,
// поэтому делаю извлечение изображений из файла и пишем в html как base64 data uri до разрешения вопроса об отдельном хранении
const inlineResourceImages = async (
  html: string,
  resourceDir: string,
): Promise<string> => {
  const srcPaths = new Set(
    [...html.matchAll(/src="([^"]*)"/g)]
      .map(([, src]) => src)
      .filter((src) => src.startsWith(resourceDir)),
  );

  let result = html;
  for (const filePath of srcPaths) {
    const data = await readFile(filePath);
    const mimeType =
      IMAGE_MIME_BY_EXT[extname(filePath).toLowerCase()] ??
      'application/octet-stream';
    const dataUri = `data:${mimeType};base64,${data.toString('base64')}`;

    result = result.split(`src="${filePath}"`).join(`src="${dataUri}"`);
  }

  return result;
};

export const fb2Converter: DocumentConverter = {
  title: 'FictionBook',
  extensions: FB2_DOC_EXT,
  mimeTypes: FB2_DOC_MIME_TYPES,

  async convert(documentPath: string): Promise<string> {
    const { initFb2File } = await importFb2Parser();

    const resourceDir = join(tmpdir(), `fb2-resources-${randomUUID()}`);
    const fb2 = await initFb2File(documentPath, resourceDir);

    try {
      const html = fb2
        .getSpine()
        .map((item) => fb2.loadChapter(item.id)?.html ?? '')
        .join('\n');

      return await inlineResourceImages(html, resourceDir);
    } finally {
      fb2.destroy();
      await rm(resourceDir, { recursive: true, force: true }).catch(() => {});
    }
  },

  sanitize(html: string): string {
    return sanitizeChapterHtml(html, {
      a: internalLinkToAnchor(FB2_LINK_PREFIX),
    });
  },
};
