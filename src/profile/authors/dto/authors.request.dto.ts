import { transformTrimString } from '@/helpers';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateAuthorRequestDto {
  @ApiProperty({ description: 'псевдоним', maxLength: 50 })
  @Transform(transformTrimString)
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  @IsString()
  declare nickname?: string;

  @ApiProperty({ description: 'email', maxLength: 150 })
  @Transform(transformTrimString)
  @IsOptional()
  @MaxLength(150)
  @IsEmail()
  declare email?: string;
}

export class CreateAuthorRequestDto {
  @ApiProperty({ description: 'псевдоним', maxLength: 50 })
  @Transform(transformTrimString)
  @MinLength(3)
  @MaxLength(50)
  @IsString()
  declare nickname: string;

  @ApiProperty({ description: 'email', maxLength: 150 })
  @Transform(transformTrimString)
  @IsOptional()
  @MaxLength(150)
  @IsEmail()
  declare email?: string;
}
