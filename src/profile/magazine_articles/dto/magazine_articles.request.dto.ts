import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { transformSanitizeHtml, transformTrimString } from '@/helpers';
import { IsMediaKey } from '@/decorators';

const SECTIONS = ['journal', 'legal'] as const;

export class SaveMagazineArticleRequestDto {
  @ApiProperty({ description: 'раздел', enum: SECTIONS })
  @IsIn(SECTIONS)
  declare section: 'journal' | 'legal';

  @ApiProperty({ maxLength: 255 })
  @Transform(transformTrimString)
  @IsString()
  @MaxLength(255)
  declare title: string;

  @ApiProperty({ required: false, maxLength: 160 })
  @IsOptional()
  @Transform(transformTrimString)
  @IsString()
  @MaxLength(160)
  declare slug?: string;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @Transform(transformTrimString)
  @IsString()
  @MaxLength(500)
  declare description?: string;

  @ApiProperty({ required: false, maxLength: 100 })
  @IsOptional()
  @Transform(transformTrimString)
  @IsString()
  @MaxLength(100)
  declare category?: string;

  @ApiProperty({
    description:
      'ключ обложки в хранилище',
    required: false,
    maxLength: 2048,
  })
  @IsOptional()
  @Transform(transformTrimString)
  @IsString()
  @MaxLength(2048)
  @IsMediaKey()
  declare coverUrl?: string;

  @ApiProperty({ required: false, description: 'html-содержимое статьи' })
  @IsOptional()
  @Transform(transformSanitizeHtml)
  @IsString()
  declare html?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  declare isPublished?: boolean;
}
