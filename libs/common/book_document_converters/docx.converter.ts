import mammoth from 'mammoth';
import { WORD_DOC_EXT, WORD_DOC_MIME_TYPES } from './constants';
import { DocumentConverter } from './document_converter.interface';
import { sanitizeChapterHtml } from './sanitize_html';

export const docxConverter: DocumentConverter = {
  title: 'Word',
  extensions: WORD_DOC_EXT,
  mimeTypes: WORD_DOC_MIME_TYPES,

  async convert(documentPath: string): Promise<string> {
    const { value } = await mammoth.convertToHtml({ path: documentPath });

    return value;
  },

  sanitize(html: string): string {
    return sanitizeChapterHtml(html);
  },
};
