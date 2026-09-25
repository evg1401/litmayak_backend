import type { EPub as EPubClass, ManifestItem } from 'epub';
import { buildBookCharacters } from './book_character';
import { EPUB_DOC_EXT, EPUB_DOC_MIME_TYPES } from './constants';
import {
  DocumentBook,
  DocumentCharacter,
  DocumentConverter,
} from './document_converter.interface';
import { removeInternalLink, sanitizeCharacterHtml } from './sanitize_html';

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

const openEpub = async (documentPath: string): Promise<EPubClass> => {
  const { EPub } = await importEpub();

  const epub = new EPub(documentPath, IMAGE_ROOT, LINK_ROOT);
  await epub.parse();

  if (epub.hasDRM()) {
    throw new Error('документ защищён DRM');
  }

  return epub;
};

// файлы глав в порядке чтения
const getCharacterItems = (epub: EPubClass): ManifestItem[] =>
  epub.flow.filter((item) => item['media-type'] === XHTML_MEDIA_TYPE);

const loadCharacterHtml = async (
  epub: EPubClass,
  item: ManifestItem,
): Promise<string> =>
  inlineManifestImages(epub, await epub.getChapter(item.id));

const getTocTitles = (epub: EPubClass): Map<string, string> => {
  const titles = new Map<string, string>();

  for (const { href, title } of epub.toc) {
    const fileHref = href.split('#')[0];
    if (title && !titles.has(fileHref)) titles.set(fileHref, title);
  }

  return titles;
};

export const epubConverter: DocumentConverter = {
  title: 'EPUB',
  extensions: EPUB_DOC_EXT,
  mimeTypes: EPUB_DOC_MIME_TYPES,

  async convert(documentPath: string): Promise<string> {
    const epub = await openEpub(documentPath);

    const characters: string[] = [];
    for (const item of getCharacterItems(epub)) {
      characters.push(await loadCharacterHtml(epub, item));
    }

    return characters.join('\n');
  },

  // разбор книги (файлы вне оглавления дописываются к предыдущей главе)
  async parseBook(documentPath: string): Promise<DocumentBook> {
    const epub = await openEpub(documentPath);
    const tocTitles = getTocTitles(epub);

    const characters: DocumentCharacter[] = [];
    for (const item of getCharacterItems(epub)) {
      const html = await loadCharacterHtml(epub, item);
      const title = tocTitles.get(item.href);
      const previous = characters.at(-1);

      if (!title && previous && tocTitles.size > 0) {
        previous.html += `\n${html}`;
        continue;
      }

      characters.push({ name: title ?? '', html });
    }

    return {
      title: epub.metadata.title?.trim() ?? '',
      characters: buildBookCharacters(characters),
    };
  },

  sanitize(html: string): string {
    return sanitizeCharacterHtml(html, { a: removeInternalLink(LINK_ROOT) });
  },
};
