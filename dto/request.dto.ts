import { transformOrderListValue, transformQueryAttrsValue } from '@/helpers';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Order } from 'sequelize';

export class QueryParamsRequestDto {
  @ApiProperty({ description: 'страница' })
  @IsOptional()
  declare page?: number;

  @ApiProperty({ description: 'лимит объектов списка' })
  @IsOptional()
  declare limit?: number;

  @ApiProperty({ description: 'атрибуты элементов списка' })
  @Transform(transformQueryAttrsValue)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  declare attrs?: string[];

  @ApiProperty({ description: 'параметр сортировки' })
  @IsOptional()
  @IsString()
  declare sort?: string;

  @ApiProperty({ description: 'порядок сортировки' })
  @Transform(transformOrderListValue)
  @IsOptional()
  @IsString()
  declare order?: string;

  buildOrderPaginationParams() {
    let order: Order = [['id', 'ASC']];
    const result: [
      number | undefined,
      number | undefined,
      string[] | undefined,
      Order | undefined,
    ] = [this.page, this.limit, this.attrs, order];

    if (this.sort) {
      order[0][0] = this.sort;

      if (this.order) {
        order[0][1] = this.order;
      } else {
        order[0][1] = 'ASC';
      }
    }

    return result;
  }
}
