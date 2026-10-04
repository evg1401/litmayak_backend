import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, MaxLength } from 'class-validator';
import { transformTrimString } from '@/helpers';

export class SubscribeNewsletterRequestDto {
  @ApiProperty({ description: 'email', maxLength: 150 })
  @Transform(transformTrimString)
  @MaxLength(150)
  @IsEmail()
  declare email: string;
}
