import { extname } from 'node:path';
import { DocumentConverter } from './document_converter.interface';
import { docxConverter } from './docx.converter';
import { epubConverter } from './epub.converter';
import { fb2Converter } from './fb2.converter';

export * from './document_converter.interface';
export { htmlToText } from './sanitize_html';

// конвертеры
export const DOC_CONVERTERS: readonly DocumentConverter[] = [
  docxConverter,
  fb2Converter,
  epubConverter,
];

export const SUPPORT_DOC_EXT: readonly string[] = DOC_CONVERTERS.flatMap(
  (converter) => [...converter.extensions],
);

export const SUPPORT_DOC_MIME_TYPES: readonly string[] = DOC_CONVERTERS.flatMap(
  (converter) => [...converter.mimeTypes],
);

// конвертеры книг
const BOOK_CONVERTERS: readonly DocumentConverter[] = DOC_CONVERTERS.filter(
  (converter) => converter.parseBook,
);

export const SUPPORT_BOOK_EXT: readonly string[] = BOOK_CONVERTERS.flatMap(
  (converter) => [...converter.extensions],
);

export const SUPPORT_BOOK_MIME_TYPES: readonly string[] =
  BOOK_CONVERTERS.flatMap((converter) => [...converter.mimeTypes]);

const findDocumentConverter = (
  extension: string,
): DocumentConverter | undefined =>
  DOC_CONVERTERS.find((converter) => converter.extensions.includes(extension));

export const getBookDocumentConverter = (
  documentPath: string,
): DocumentConverter | undefined =>
  findDocumentConverter(extname(documentPath).toLowerCase());
