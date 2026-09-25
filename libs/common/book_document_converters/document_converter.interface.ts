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
}
