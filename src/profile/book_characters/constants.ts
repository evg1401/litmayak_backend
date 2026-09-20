// доступные расширения документов ms word
export enum WordDocumentExtensions {
  Docx = '.docx',
  Docm = '.docm',
  Dotx = '.dotx',
  Dotm = '.dotm',
}

export const WORD_DOC_EXT: WordDocumentExtensions[] = Object.values(
  WordDocumentExtensions,
);

// mime, соответствующие WordDocumentExtensions в том же порядке
export const WORD_DOC_MIME_TYPES: string[] = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-word.document.macroEnabled.12',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  'application/vnd.ms-word.template.macroEnabled.12',
];

export const DOC_MAX_SIZE_BYTES = 10 * 1024 * 1024;
