import type { EPub as EPubClass } from 'epub';
import { EPUB_DOC_EXT, EPUB_DOC_MIME_TYPES } from './constants';
import { DocumentConverter } from './document_converter.interface';
import { internalLinkToAnchor, sanitizeChapterHtml } from './sanitize_html';

const importEpub = async (): Promise<{ EPub: typeof EPubClass }> =>
  import('epub');

const IMAGE_ROOT = 'epub-image://';
const LINK_ROOT = 'epub-link://';
const IMAGE_SRC_REGEXP = new RegExp(
  `${IMAGE_ROOT}([^/"'\\s>]+)/[^"'\\s>]*`,
  'g',
);

const XHTML_MEDIA_TYPE = 'application/xhtml+xml';

const inlineManifestImages = async (
  epub: EPubClass,
  html: string,
): Promise<string> => {
  const imageIds = new Set(
    [...html.matchAll(IMAGE_SRC_REGEXP)].map(([, id]) => id),
  );

  const dataUris = new Map<string, string>();
  for (const id of imageIds) {
    const { data, mimeType } = await epub.getImage(id);
    dataUris.set(id, `data:${mimeType};base64,${data.toString('base64')}`);
  }

  return html.replace(
    IMAGE_SRC_REGEXP,
    (_src, id: string) => dataUris.get(id) ?? '',
  );
};

export const epubConverter: DocumentConverter = {
  title: 'EPUB',
  extensions: EPUB_DOC_EXT,
  mimeTypes: EPUB_DOC_MIME_TYPES,

  async convert(documentPath: string): Promise<string> {
    const { EPub } = await importEpub();

    const epub = new EPub(documentPath, IMAGE_ROOT, LINK_ROOT);
    await epub.parse();

    if (epub.hasDRM()) {
      throw new Error('документ защищён DRM');
    }

    const chapters: string[] = [];
    for (const item of epub.flow) {
      if (item['media-type'] !== XHTML_MEDIA_TYPE) continue;

      chapters.push(await epub.getChapter(item.id));
    }

    return inlineManifestImages(epub, chapters.join('\n'));
  },

  sanitize(html: string): string {
    return sanitizeChapterHtml(html, { a: internalLinkToAnchor(LINK_ROOT) });
  },
};
