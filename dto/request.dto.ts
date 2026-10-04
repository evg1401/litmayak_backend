import { transformOrderListValue, transformQueryAttrsValue } from '@/helpers';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Order } from 'sequelize';

export const PAGE_LIMIT_MAX = 100;

export class QueryParamsRequestDto {
  @ApiProperty({ description: 'страница', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare page?: number;

  @ApiProperty({
    description: 'лимит объектов списка',
    minimum: 1,
    maximum: PAGE_LIMIT_MAX,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGE_LIMIT_MAX)
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
    const order: Order = [
      [this.sort ?? 'id', this.order === 'DESC' ? 'DESC' : 'ASC'],
    ];

    const result: [
      number | undefined,
      number | undefined,
      string[] | undefined,
      Order | undefined,
    ] = [this.page, this.limit, this.attrs, order];

    return result;
  }
}
