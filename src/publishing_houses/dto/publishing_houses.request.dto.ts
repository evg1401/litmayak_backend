import {
  createStrNumValidationErrorMessage,
  transformTrimString,
} from '@/helpers';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  Length,
  IsNumberString,
  MaxLength,
} from 'class-validator';

export class CreatePublishingHousesRequestDto {
  @ApiProperty({ description: 'наименование', maxLength: 255 })
  @Transform(transformTrimString)
  @MinLength(3)
  @MaxLength(255)
  @IsString()
  declare name: string;

  @ApiProperty({ description: 'ИНН' })
  @Transform(transformTrimString)
  @Length(10, 10, { message: 'номер ИНН должен быть 10-значным' })
  @IsNumberString({}, { message: createStrNumValidationErrorMessage })
  declare inn: string;

  @ApiProperty({ description: 'КПП' })
  @Transform(transformTrimString)
  @Length(9, 9, { message: 'номер КПП должен быть 9-значным' })
  @IsNumberString({}, { message: createStrNumValidationErrorMessage })
  declare kpp: string;

  @ApiProperty({ description: 'Адрес регистрации', maxLength: 255 })
  @Transform(transformTrimString)
  @MaxLength(255)
  @IsString()
  declare legalAddress: string;

  @ApiProperty({ description: 'email', maxLength: 150 })
  @Transform(transformTrimString)
  @IsOptional()
  @MaxLength(150)
  @IsEmail()
  declare email?: string;

  @ApiProperty({ description: 'Телефон', maxLength: 50 })
  @Transform(transformTrimString)
  @MaxLength(50)
  @IsNumberString()
  @IsString()
  declare contactPhone: string;

  @ApiProperty({ description: 'ФИО контактного лица', maxLength: 256 })
  @Transform(transformTrimString)
  @MaxLength(256)
  @IsString()
  declare contactFullname: string;
}

export class UpdatePublishingHousesRequestDto {
  @ApiProperty({ description: 'наименование', maxLength: 255 })
  @Transform(transformTrimString)
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  @IsString()
  declare name?: string;

  @ApiProperty({ description: 'ИНН' })
  @Transform(transformTrimString)
  @IsOptional()
  @Length(10, 10, { message: 'номер ИНН должен быть 10-значным' })
  @IsNumberString({}, { message: createStrNumValidationErrorMessage })
  declare inn?: string;

  @ApiProperty({ description: 'КПП' })
  @Transform(transformTrimString)
  @IsOptional()
  @Length(9, 9, { message: 'номер КПП должен быть 9-значным' })
  @IsNumberString({}, { message: createStrNumValidationErrorMessage })
  declare kpp?: string;

  @ApiProperty({ description: 'Адрес регистрации', maxLength: 255 })
  @Transform(transformTrimString)
  @IsOptional()
  @MaxLength(255)
  @IsString()
  declare legalAddress?: string;

  @ApiProperty({ description: 'email', maxLength: 150 })
  @Transform(transformTrimString)
  @IsOptional()
  @MaxLength(150)
  @IsEmail()
  declare email?: string;

  @ApiProperty({ description: 'Телефон', maxLength: 50 })
  @Transform(transformTrimString)
  @IsOptional()
  @MaxLength(50)
  @IsNumberString()
  @IsString()
  declare contactPhone?: string;

  @ApiProperty({ description: 'ФИО контактного лица', maxLength: 256 })
  @Transform(transformTrimString)
  @IsOptional()
  @MaxLength(256)
  @IsString()
  declare contactFullname?: string;
}
