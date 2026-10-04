import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { transformTrimString } from '@/helpers';
import { AuthorTaxStatus } from '@/common/constants/author_verification.constants';

const TAX_STATUSES = Object.values(AuthorTaxStatus);

export class SubmitAuthorVerificationRequestDto {
  @ApiProperty({ description: 'страна резиденства', maxLength: 100 })
  @Transform(transformTrimString)
  @IsString()
  @MaxLength(100)
  declare country: string;

  @ApiProperty({ description: 'налоговый статус', enum: TAX_STATUSES })
  @IsIn(TAX_STATUSES)
  declare taxStatus: AuthorTaxStatus;

  @ApiProperty({ required: false, maxLength: 100 })
  @IsOptional()
  @Transform(transformTrimString)
  @IsString()
  @MaxLength(100)
  declare lastName?: string;

  @ApiProperty({ required: false, maxLength: 100 })
  @IsOptional()
  @Transform(transformTrimString)
  @IsString()
  @MaxLength(100)
  declare firstName?: string;

  @ApiProperty({ required: false, maxLength: 100 })
  @IsOptional()
  @Transform(transformTrimString)
  @IsString()
  @MaxLength(100)
  declare middleName?: string;

  @ApiProperty({ required: false, description: 'дата рождения, ISO' })
  @IsOptional()
  @IsISO8601()
  declare birthDate?: string;

  @ApiProperty({ required: false, maxLength: 20 })
  @IsOptional()
  @Transform(transformTrimString)
  @IsString()
  @MaxLength(20)
  declare snils?: string;

  @ApiProperty({ required: false, description: 'дата выдачи паспорта, ISO' })
  @IsOptional()
  @IsISO8601()
  declare passportIssueDate?: string;

  @ApiProperty({ required: false, maxLength: 10 })
  @IsOptional()
  @Transform(transformTrimString)
  @IsString()
  @MaxLength(10)
  declare passportSeries?: string;

  @ApiProperty({ required: false, maxLength: 20 })
  @IsOptional()
  @Transform(transformTrimString)
  @IsString()
  @MaxLength(20)
  declare passportNumber?: string;

  @ApiProperty({ required: false, maxLength: 20 })
  @IsOptional()
  @Transform(transformTrimString)
  @IsString()
  @MaxLength(20)
  declare inn?: string;

  @ApiProperty({ required: false, maxLength: 20 })
  @IsOptional()
  @Transform(transformTrimString)
  @IsString()
  @MaxLength(20)
  declare kpp?: string;

  @ApiProperty({ required: false, maxLength: 20 })
  @IsOptional()
  @Transform(transformTrimString)
  @IsString()
  @MaxLength(20)
  declare ogrn?: string;

  @ApiProperty({ description: 'расчётный счёт', maxLength: 30 })
  @Transform(transformTrimString)
  @IsString()
  @MaxLength(30)
  declare bankAccount: string;

  @ApiProperty({ description: 'БИК', maxLength: 20 })
  @Transform(transformTrimString)
  @IsString()
  @MaxLength(20)
  declare bik: string;

  @ApiProperty({ description: 'согласие с условиями' })
  @IsBoolean()
  declare agreedToTerms: boolean;
}
