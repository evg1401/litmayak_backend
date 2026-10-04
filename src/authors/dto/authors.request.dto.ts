import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class PopularAuthorsQueryDto {
  @ApiProperty({ description: 'сколько авторов вернуть', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  declare limit?: number;

  @ApiProperty({
    description: 'сортировка: по числу книг (по умолчанию) или подписчиков',
    required: false,
    enum: ['books', 'followers'],
  })
  @IsOptional()
  @IsIn(['books', 'followers'])
  declare sort?: 'books' | 'followers';
}

export class NewestAuthorsQueryDto {
  @ApiProperty({ description: 'сколько авторов вернуть', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  declare limit?: number;
}
