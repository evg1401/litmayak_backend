import { transformTrimString } from '@/helpers';
import { IsMediaKey, IsOptionalNotNull } from '@/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBooksRequestDto {
  @ApiProperty({ description: 'id издательского дома', required: false })
  @IsOptionalNotNull()
  @IsInt()
  declare publishingHouseId?: number;

  @ApiProperty({
    description:
      'id жанров и поджанров книги - можно указывать сразу несколько жанров и несколько поджанров',
    required: false,
    type: [Number],
  })
  @IsOptionalNotNull()
  @IsArray()
  @ArrayMaxSize(20)
  @IsInt({ each: true })
  declare genreIds?: number[];

  @ApiProperty({ description: 'наименование', maxLength: 256 })
  @Transform(transformTrimString)
  @MinLength(1)
  @MaxLength(256)
  @IsString()
  declare name: string;

  @ApiProperty({ description: 'uid', maxLength: 256 })
  @Transform(transformTrimString)
  @MaxLength(256)
  @IsString()
  declare uid: string;

  @ApiProperty({ description: 'год', maxLength: 256 })
  @Transform(transformTrimString)
  @MaxLength(256)
  @IsString()
  declare year: string;

  @ApiProperty({ description: 'описание' })
  @Transform(transformTrimString)
  @IsString()
  declare description: string;

  @ApiProperty({ description: 'язык', maxLength: 50 })
  @Transform(transformTrimString)
  @MaxLength(50)
  @IsString()
  declare language: string;
}

export class UpdateBooksRequestDto {
  @ApiProperty({ description: 'id издательского дома', required: false })
  @IsOptional()
  @IsInt()
  declare publishingHouseId?: number | null;

  @ApiProperty({
    description:
      'id жанров и поджанров книги - полностью заменяет текущий набор',
    required: false,
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsInt({ each: true })
  declare genreIds?: number[];

  @ApiProperty({ description: 'наименование', maxLength: 256 })
  @Transform(transformTrimString)
  @IsOptional()
  @MinLength(1)
  @MaxLength(256)
  @IsString()
  declare name?: string;

  @ApiProperty({ description: 'uid', maxLength: 256 })
  @Transform(transformTrimString)
  @IsOptional()
  @MaxLength(256)
  @IsString()
  declare uid?: string;

  @ApiProperty({ description: 'год', maxLength: 256 })
  @Transform(transformTrimString)
  @IsOptional()
  @MaxLength(256)
  @IsString()
  declare year?: string;

  @ApiProperty({ description: 'описание' })
  @Transform(transformTrimString)
  @IsOptional()
  @IsString()
  declare description?: string;

  @ApiProperty({ description: 'язык', maxLength: 50 })
  @Transform(transformTrimString)
  @IsOptional()
  @MaxLength(50)
  @IsString()
  declare language?: string;

  @ApiProperty({ description: 'статус публикации (true - опубликована)' })
  @IsOptional()
  @IsBoolean()
  declare status?: boolean;

  @ApiProperty({
    description:
      'ключи изображений в хранилище (key из POST profile/uploads/presign), обложка первой',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsMediaKey('books', { each: true })
  declare images?: string[];
}
