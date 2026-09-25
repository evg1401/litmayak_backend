import { transformTrimString } from '@/helpers';
import { IsOptionalNotNull } from '@/decorators';
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
  @ApiProperty({ description: 'статус публикации' })
  @IsOptional()
  @IsBoolean()
  status: boolean = false;

  @ApiProperty({
    description: 'ссылка на титульное изображение главы',
    maxLength: 255,
  })
  @Transform(transformTrimString)
  @IsOptional()
  @MaxLength(255)
  @IsUrl()
  declare cdnLinkFolder: string;

  @ApiProperty({ description: 'наименование', maxLength: 255 })
  @Transform(transformTrimString)
  @MinLength(3)
  @MaxLength(255)
  @IsString()
  declare name: string;

  @ApiProperty({ description: 'сортировка' })
  @IsOptional()
  @IsInt()
  declare order: number;
}

export class UpdateBookCharactersRequestDto {
  @ApiProperty({ description: 'статус публикации' })
  @IsOptionalNotNull()
  @IsBoolean()
  declare status?: boolean;

  @ApiProperty({ description: 'сортировка' })
  @IsOptionalNotNull()
  @IsInt()
  declare order: number;

  @ApiProperty({ description: 'наименование', maxLength: 255 })
  @Transform(transformTrimString)
  @MinLength(3)
  @MaxLength(255)
  @IsOptionalNotNull()
  @IsString()
  declare name: string;

  @ApiProperty({
    description: 'ссылка на титульное изображение главы',
    maxLength: 255,
  })
  @Transform(transformTrimString)
  @IsOptionalNotNull()
  @MaxLength(255)
  @IsUrl()
  declare cdnLinkFolder: string;
}
