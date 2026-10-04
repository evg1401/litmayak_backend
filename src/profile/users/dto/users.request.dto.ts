import { MaxJsonSize } from '@/decorators/json_size.validator';
import { IsMediaKey } from '@/decorators/media_url.validator';
import {
  NICKNAME_REGEX_MESSAGE,
  NICKNAME_REGEX_PATTERN,
} from '@/common/constants/regex.constants';
import { transformTrimString } from '@/helpers';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
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

  @ApiProperty({
    description: 'nickname, единый для читателя и автора',
    maxLength: 50,
  })
  @Transform(transformTrimString)
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  @IsString()
  @Matches(NICKNAME_REGEX_PATTERN, { message: NICKNAME_REGEX_MESSAGE })
  declare nickname?: string;

  @ApiProperty({
    description:
      'имя аватара в хранилище (null - удалить)',
    maxLength: 256,
    required: false,
  })
  @Transform(transformTrimString)
  @IsOptional()
  @MaxLength(256)
  @IsMediaKey('avatars')
  declare avatar?: string | null;

  @ApiProperty({ description: 'дополнительные поля' })
  @IsOptional()
  @MaxJsonSize(ADDITIONAL_FIELDS_MAX_BYTES)
  @IsObject()
  declare additionalFields?: any;
}

export class CheckNicknameQueryDto {
  @ApiProperty({ description: 'проверяемый nickname', maxLength: 50 })
  @Transform(transformTrimString)
  @MinLength(3)
  @MaxLength(50)
  @Matches(NICKNAME_REGEX_PATTERN, { message: NICKNAME_REGEX_MESSAGE })
  declare nickname: string;
}
