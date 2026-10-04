import sanitize from 'sanitize-html';

const SANITIZE_OPTIONS: sanitize.IOptions = {
  allowedTags: [...sanitize.defaults.allowedTags, 'img'],
  allowedAttributes: {
    ...sanitize.defaults.allowedAttributes,
    '*': ['class', 'style'],
  },
  allowedStyles: {
    '*': { 'text-align': [/^(left|right|center|justify)$/] },
  },
  // изображения глав из fb2/epub встраиваются как base64 data uri
  allowedSchemesByTag: { img: ['https', 'http', 'data'] },
};

export const sanitizeHtml = (html: string): string =>
  sanitize(html, SANITIZE_OPTIONS);

export const transformSanitizeHtml = ({ value }) =>
  typeof value === 'string' ? sanitizeHtml(value) : value;
