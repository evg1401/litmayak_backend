import { transformSanitizeHtml, transformTrimString } from '@/helpers';
import { IsMediaKey, IsOptionalNotNull } from '@/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBookCharactersRequestDto {
  @ApiProperty({ description: 'id книги', required: true })
  @IsInt()
  declare bookId: number;

  @ApiProperty({ description: 'статус публикации' })
  @IsOptionalNotNull()
  @IsBoolean()
  status: boolean = false;

  @ApiProperty({
    description:
      'ключ титульного изображения главы в хранилище (key из POST profile/uploads/presign)',
    maxLength: 255,
  })
  @Transform(transformTrimString)
  @IsOptionalNotNull()
  @MaxLength(255)
  @IsMediaKey()
  declare cdnLinkFolder: string;

  @ApiProperty({ description: 'наименование', maxLength: 255 })
  @Transform(transformTrimString)
  @MinLength(3)
  @MaxLength(255)
  @IsString()
  declare name: string;

  @ApiProperty({ description: 'сортировка' })
  @IsOptionalNotNull()
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
    description:
      'ключ титульного изображения главы в хранилище (key из POST profile/uploads/presign)',
    maxLength: 255,
  })
  @Transform(transformTrimString)
  @IsOptionalNotNull()
  @MaxLength(255)
  @IsMediaKey()
  declare cdnLinkFolder: string;

  @ApiProperty({ description: 'текст главы (html из редактора)' })
  @Transform(transformSanitizeHtml)
  @IsOptionalNotNull()
  @IsString()
  declare xhtml?: string;
}

export class GetBookCharactersRequestDto {
  @ApiProperty({ description: 'id книги' })
  @Type(() => Number)
  @IsInt()
  declare bookId: number;
}

export class PublishDraftCharactersRequestDto {
  @ApiProperty({ description: 'id книги' })
  @IsInt()
  declare bookId: number;
}
