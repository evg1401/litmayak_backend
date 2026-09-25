import sanitizeHtml, { IOptions, Transformer } from 'sanitize-html';

// общие правила очистки html главы
const CHARACTER_SANITIZE_OPTIONS: IOptions = {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
  allowedAttributes: {
    '*': ['id'],
    a: ['href', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    ol: ['start', 'type'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { img: ['data'] },
  allowProtocolRelative: false,
  // изображение без src удаляется
  exclusiveFilter: (frame) => frame.tag === 'img' && !frame.attribs.src,
};

export const sanitizeCharacterHtml = (
  html: string,
  transformTags?: IOptions['transformTags'],
): string =>
  sanitizeHtml(html, { ...CHARACTER_SANITIZE_OPTIONS, transformTags });

const BLOCK_TAG_REGEXP = /<\/?(p|div|br|h[1-6]|li|tr|td|th)\b/gi;

const decodeEscapedText = (text: string): string =>
  text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');

export const htmlToText = (html: string): string =>
  decodeEscapedText(
    sanitizeHtml(html.replace(BLOCK_TAG_REGEXP, ' $&'), {
      allowedTags: [],
      allowedAttributes: {},
    }),
  )
    .replace(/\s+/g, ' ')
    .trim();

// очистка ссылок из текста
export const removeInternalLink =
  (prefix: string): Transformer =>
  (tagName, attribs) => {
    const { href, ...rest } = attribs;

    return { tagName, attribs: href?.startsWith(prefix) ? rest : attribs };
  };
