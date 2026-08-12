import {
  AuthNumberValidation,
  PhoneAdditionalValidation,
} from '@/decorators/phone.validator';
import {
  createAuthCodeErrorMessage,
  createStrValidationErrorMessage,
  createStrValidationPhoneErrorMessage,
} from '@/helpers';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsPhoneNumber, Validate, IsNumber } from 'class-validator';

export class GenerateCodeRequestDto {
  @ApiProperty({ description: 'Номер телефона 7+10 цифр номера' })
  @IsPhoneNumber('RU', { message: createStrValidationPhoneErrorMessage })
  @Validate(PhoneAdditionalValidation)
  declare phone: string;

  @ApiProperty({ description: 'Канал доставки кода' })
  @IsString({ message: createStrValidationErrorMessage })
  declare channel: string;
}

export class SignInCodeRequestDto {
  @ApiProperty({ description: 'Номер телефона 7+10 цифр номера' })
  @IsPhoneNumber('RU', { message: createStrValidationPhoneErrorMessage })
  @Validate(PhoneAdditionalValidation)
  declare phone: string;

  @ApiProperty({ description: 'Проверочный код' })
  @IsNumber({}, { message: createAuthCodeErrorMessage })
  @Validate(AuthNumberValidation)
  declare code: number;
}
