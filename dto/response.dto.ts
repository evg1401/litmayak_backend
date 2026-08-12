import { Expose } from 'class-transformer';

export class ResponseDto<T> {
  @Expose()
  declare result: T;
}

export type PageList<T> = {
  count: number;
  total: number;
  items: T[];
};

export type List<T> = {
  count: number;
  items: T[];
};
