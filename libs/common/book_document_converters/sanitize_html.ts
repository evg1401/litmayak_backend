import sanitizeHtml, { IOptions, Transformer } from 'sanitize-html';

// общие правила очистки html главы
const CHAPTER_SANITIZE_OPTIONS: IOptions = {
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

export const sanitizeChapterHtml = (
  html: string,
  transformTags?: IOptions['transformTags'],
): string => sanitizeHtml(html, { ...CHAPTER_SANITIZE_OPTIONS, transformTags });

// превращает ссылки между главами документа в якоря
export const internalLinkToAnchor =
  (prefix: string): Transformer =>
  (tagName, attribs) => {
    const { href, ...rest } = attribs;
    if (!href?.startsWith(prefix)) return { tagName, attribs };

    const anchorIndex = href.indexOf('#');

    return {
      tagName,
      attribs:
        anchorIndex === -1 ? rest : { ...rest, href: href.slice(anchorIndex) },
    };
  };
