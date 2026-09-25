import { extname } from 'node:path';
import { DocumentConverter } from './document_converter.interface';
import { docxConverter } from './docx.converter';
import { epubConverter } from './epub.converter';
import { fb2Converter } from './fb2.converter';

export * from './document_converter.interface';

// конвертеры
export const DOC_CONVERTERS: readonly DocumentConverter[] = [
  docxConverter,
  fb2Converter,
  epubConverter,
];

export const SUPPORT_DOC_EXT: readonly string[] =
  DOC_CONVERTERS.flatMap((converter) => [...converter.extensions]);

export const SUPPORT_DOC_MIME_TYPES: readonly string[] =
  DOC_CONVERTERS.flatMap((converter) => [...converter.mimeTypes]);

const findDocumentConverter = (
  extension: string,
): DocumentConverter | undefined =>
  DOC_CONVERTERS.find((converter) =>
    converter.extensions.includes(extension),
  );

export const getBookDocumentConverter = (
  documentPath: string,
): DocumentConverter | undefined =>
  findDocumentConverter(extname(documentPath).toLowerCase());
