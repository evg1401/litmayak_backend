import { transformNumValue, transformTrimString } from '@/helpers';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBooksRequestDto {
  @ApiProperty({ description: 'id издательского дома', required: false })
  @IsOptional()
  @IsInt()
  declare publishingHouseId?: number;

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

export class CreateBookFromFileRequestDto {
  @ApiProperty({ description: 'id издательского дома', required: false })
  @Transform(transformNumValue)
  @IsOptional()
  @IsInt()
  declare publishingHouseId?: number;
}

export class UpdateBooksRequestDto {
  @ApiProperty({ description: 'id издательского дома', required: false })
  @IsOptional()
  @IsInt()
  declare publishingHouseId?: number | null;

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
}
