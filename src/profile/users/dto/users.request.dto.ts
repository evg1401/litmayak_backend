import { MaxJsonSize } from '@/decorators/json_size.validator';
import { transformTrimString } from '@/helpers';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const ADDITIONAL_FIELDS_MAX_BYTES = 16 * 1024;

export class UpdateUserRequestDto {
  @ApiProperty({ description: 'ФИО', maxLength: 256 })
  @Transform(transformTrimString)
  @IsOptional()
  @MaxLength(256)
  @IsString()
  declare fullname?: string;

  @ApiProperty({ description: 'email', maxLength: 150 })
  @Transform(transformTrimString)
  @IsOptional()
  @MaxLength(150)
  @IsEmail()
  declare email?: string;

  @ApiProperty({ description: 'дополнительные поля' })
  @IsOptional()
  @MaxJsonSize(ADDITIONAL_FIELDS_MAX_BYTES)
  @IsObject()
  declare additionalFields?: any;
}
