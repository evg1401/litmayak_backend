import { ApiProperty } from '@nestjs/swagger';
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

  @ApiProperty({ description: 'наименование' })
  @MinLength(1)
  @MaxLength(256)
  @IsString()
  declare name: string;

  @ApiProperty({ description: 'uid' })
  @MaxLength(256)
  @IsString()
  declare uid: string;

  @ApiProperty({ description: 'год' })
  @MaxLength(256)
  @IsString()
  declare year: string;

  @ApiProperty({ description: 'описание' })
  @IsString()
  declare description: string;

  @ApiProperty({ description: 'язык' })
  @MaxLength(50)
  @IsString()
  declare language: string;
}

export class UpdateBooksRequestDto {
  @ApiProperty({ description: 'id издательского дома', required: false })
  @IsOptional()
  @IsInt()
  declare publishingHouseId?: number | null;

  @ApiProperty({ description: 'наименование' })
  @IsOptional()
  @MinLength(1)
  @MaxLength(256)
  @IsString()
  declare name?: string;

  @ApiProperty({ description: 'uid' })
  @IsOptional()
  @MaxLength(256)
  @IsString()
  declare uid?: string;

  @ApiProperty({ description: 'год' })
  @IsOptional()
  @MaxLength(256)
  @IsString()
  declare year?: string;

  @ApiProperty({ description: 'описание' })
  @IsOptional()
  @IsString()
  declare description?: string;

  @ApiProperty({ description: 'язык' })
  @IsOptional()
  @MaxLength(50)
  @IsString()
  declare language?: string;
}
