import {
  AuthNumberValidation,
  PhoneAdditionalValidation,
} from '@/decorators/phone.validator';
import {
  createAuthCodeErrorMessage,
  createStrValidationErrorMessage,
  createStrValidationPhoneErrorMessage,
  transformTrimString,
} from '@/helpers';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsPhoneNumber,
  Validate,
  IsNumber,
  MaxLength,
} from 'class-validator';

export class GenerateCodeRequestDto {
  @ApiProperty({
    description: 'Номер телефона 7+10 цифр номера',
    maxLength: 50,
  })
  @Transform(transformTrimString)
  @MaxLength(50)
  @IsPhoneNumber('RU', { message: createStrValidationPhoneErrorMessage })
  @Validate(PhoneAdditionalValidation)
  declare phone: string;

  @ApiProperty({ description: 'Канал доставки кода', maxLength: 50 })
  @Transform(transformTrimString)
  @MaxLength(50)
  @IsString({ message: createStrValidationErrorMessage })
  declare channel: string;
}

export class SignInCodeRequestDto {
  @ApiProperty({
    description: 'Номер телефона 7+10 цифр номера',
    maxLength: 50,
  })
  @Transform(transformTrimString)
  @MaxLength(50)
  @IsPhoneNumber('RU', { message: createStrValidationPhoneErrorMessage })
  @Validate(PhoneAdditionalValidation)
  declare phone: string;

  @ApiProperty({ description: 'Проверочный код' })
  @IsNumber({}, { message: createAuthCodeErrorMessage })
  @Validate(AuthNumberValidation)
  declare code: number;
}
