import { IsOptionalNotNull } from '@/decorators';
import { transformTrimString } from '@/helpers';
import {
  NICKNAME_REGEX_MESSAGE,
  NICKNAME_REGEX_PATTERN,
} from '@/common/constants/regex.constants';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
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
  @Matches(NICKNAME_REGEX_PATTERN, { message: NICKNAME_REGEX_MESSAGE })
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
  @Matches(NICKNAME_REGEX_PATTERN, { message: NICKNAME_REGEX_MESSAGE })
  declare nickname: string;

  @ApiProperty({ description: 'email', maxLength: 150 })
  @Transform(transformTrimString)
  @IsOptionalNotNull()
  @MaxLength(150)
  @IsEmail()
  declare email?: string;
}
