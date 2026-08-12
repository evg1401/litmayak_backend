import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateUserRequestDto {
  @ApiProperty({ description: 'ФИО' })
  @IsOptional()
  @IsString()
  declare fullname?: string;

  @ApiProperty({ description: 'email' })
  @IsOptional()
  @IsEmail()
  declare email?: string;
}
