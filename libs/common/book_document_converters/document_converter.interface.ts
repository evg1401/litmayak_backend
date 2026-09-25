export interface DocumentCharacter {
  name: string;
  html: string;
}

export interface DocumentBook {
  title: string;
  characters: DocumentCharacter[];
}

// сервис выбирает нужный по расширению файла
export interface DocumentConverter {
  // название формата
  readonly title: string;

  //расширения с ведущей точкой
  readonly extensions: readonly string[];

  // mime
  readonly mimeTypes: readonly string[];

  convert(documentPath: string): Promise<string>;

  sanitize(html: string): string;

  // разбор документа на книгу и главы
  parseBook?(documentPath: string): Promise<DocumentBook>;
}
