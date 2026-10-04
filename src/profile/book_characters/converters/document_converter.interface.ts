// конвертер документа главы
// сервис выбирает нужный по расширению файла
export interface DocumentConverter {
  // название формата
  readonly title: string;

  // принимаемые расширения с ведущей точкой
  readonly extensions: readonly string[];

  // mime, соответствующие расширениям
  readonly mimeTypes: readonly string[];

  convert(documentPath: string): Promise<string>;
}
