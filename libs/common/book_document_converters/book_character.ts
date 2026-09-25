import { DocumentCharacter } from './document_converter.interface';
import { htmlToText } from './sanitize_html';

const HEADING_REGEXP = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i;

// рабирает книгу на главы и заголовки
export const buildBookCharacters = (
  characters: DocumentCharacter[],
): DocumentCharacter[] => {
  const names = new Set<string>();
  const result: DocumentCharacter[] = [];

  for (const { name, html } of characters) {
    if (!htmlToText(html)) continue;

    const heading = HEADING_REGEXP.exec(html)?.[1];
    const baseName =
      name.trim() ||
      (heading ? htmlToText(heading) : '') ||
      `Глава ${result.length + 1}`;

    let uniqueName = baseName;
    for (let index = 2; names.has(uniqueName); index++) {
      uniqueName = `${baseName} (${index})`;
    }

    names.add(uniqueName);
    result.push({ name: uniqueName, html });
  }

  return result;
};
