import { createStrNumValidationErrorMessage } from '@/helpers';
import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ description: 'наименование' })
  @MinLength(3)
  @IsString()
  declare name: string;

  @ApiProperty({ description: 'ИНН' })
  @Length(10, 10, { message: 'номер ИНН должен быть 10-значным' })
  @IsNumberString({}, { message: createStrNumValidationErrorMessage })
  declare inn: string;

  @ApiProperty({ description: 'КПП' })
  @Length(9, 9, { message: 'номер КПП должен быть 9-значным' })
  @IsNumberString({}, { message: createStrNumValidationErrorMessage })
  declare kpp: string;

  @ApiProperty({ description: 'Адрес регистрации' })
  @MaxLength(255)
  @IsString()
  declare legalAddress: string;

  @ApiProperty({ description: 'email' })
  @IsOptional()
  @MaxLength(150)
  @IsEmail()
  declare email?: string;

  @ApiProperty({ description: 'Телефон' })
  @MaxLength(50)
  @IsNumberString()
  @IsString()
  declare contactPhone: string;

  @ApiProperty({ description: 'ФИО контактного лица' })
  @IsString()
  declare contactFullname: string;
}

export class UpdatePublishingHousesRequestDto {
  @ApiProperty({ description: 'наименование' })
  @IsOptional()
  @MinLength(3)
  @IsString()
  declare name?: string;

  @ApiProperty({ description: 'ИНН' })
  @IsOptional()
  @Length(10, 10, { message: 'номер ИНН должен быть 10-значным' })
  @IsNumberString({}, { message: createStrNumValidationErrorMessage })
  declare inn?: string;

  @ApiProperty({ description: 'КПП' })
  @IsOptional()
  @Length(9, 9, { message: 'номер КПП должен быть 9-значным' })
  @IsNumberString({}, { message: createStrNumValidationErrorMessage })
  declare kpp?: string;

  @ApiProperty({ description: 'Адрес регистрации' })
  @IsOptional()
  @MaxLength(255)
  @IsString()
  declare legalAddress?: string;

  @ApiProperty({ description: 'email' })
  @IsOptional()
  @MaxLength(150)
  @IsEmail()
  declare email?: string;

  @ApiProperty({ description: 'Телефон' })
  @IsOptional()
  @MaxLength(50)
  @IsNumberString()
  @IsString()
  declare contactPhone?: string;

  @ApiProperty({ description: 'ФИО контактного лица' })
  @IsOptional()
  @IsString()
  declare contactFullname?: string;
}
