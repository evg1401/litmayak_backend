import { transformTrimString } from '@/helpers';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBookCharactersRequestDto {
  @ApiProperty({ description: 'id книги', required: true })
  @IsInt()
  declare bookId: number;

  @ApiProperty({ description: 'статус публикации' })
  @IsOptional()
  @IsBoolean()
  status: boolean = false;

  @ApiProperty({ description: 'ссылка на титульное изображение главы' })
  @IsOptional()
  @IsUrl()
  declare cdnLinkFolder: string;

  @ApiProperty({ description: 'наименование' })
  @Transform(transformTrimString)
  @MinLength(3)
  @MaxLength(256)
  @IsString()
  declare name: string;

  @ApiProperty({ description: 'сортировка' })
  @IsOptional()
  @IsInt()
  declare order: number;
}

export class UpdateBookCharactersRequestDto {
  @ApiProperty({ description: 'статус публикации' })
  @IsOptional()
  @IsBoolean()
  declare status?: boolean;

  @ApiProperty({ description: 'сортировка' })
  @IsOptional()
  @IsInt()
  declare order: number;

  @ApiProperty({ description: 'наименование' })
  @Transform(transformTrimString)
  @MinLength(3)
  @MaxLength(256)
  @IsOptional()
  @IsString()
  declare name: string;

  // @ApiProperty({ description: 'текст главы' })
  // @Transform(transformTrimString)
  // @IsOptional()
  // @IsString()
  // declare text: string;
}
