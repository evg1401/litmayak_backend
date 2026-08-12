import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, MinLength } from 'class-validator';

export class UpdateAuthorRequestDto {
  @ApiProperty({ description: 'псевдоним' })
  @IsOptional()
  @MinLength(3)
  @IsString()
  declare nickName?: string;

  @ApiProperty({ description: 'email' })
  @IsOptional()
  @IsEmail()
  declare email?: string;
}


export class CreateAuthorRequestDto {
  @ApiProperty({ description: 'псевдоним' })
  @IsOptional()
  @MinLength(3)
  @IsString()
  declare nickName?: string;

  @ApiProperty({ description: 'email' })
  @IsOptional()
  @IsEmail()
  declare email?: string;
}
