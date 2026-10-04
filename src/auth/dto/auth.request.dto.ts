import {
  AuthNumberValidation,
  PhoneAdditionalValidation,
} from '@/decorators/phone.validator';
import {
  IsNotTogetherWith,
  isBlankValue,
} from '@/decorators/not_together_with.validator';
import {
  createAuthCodeErrorMessage,
  createStrValidationErrorMessage,
  createStrValidationPhoneErrorMessage,
  transformTrimString,
} from '@/helpers';
import { Channels } from '@/notifications/dto/notifications.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsIn,
  Validate,
  ValidateIf,
  IsNumber,
  MaxLength,
  MinLength,
} from 'class-validator';


const ALLOWED_CODE_CHANNELS = [Channels.email, Channels.telegram, Channels.max];

export class GenerateCodeRequestDto {
  @ApiProperty({
    description: 'Номер телефона 7+10 цифр номера. Обязателен, если не указан email',
    maxLength: 50,
    required: false,
  })
  @ValidateIf((o) => !isBlankValue(o.phone) || isBlankValue(o.email))
  @Transform(transformTrimString)
  @MaxLength(50)
  @Validate(PhoneAdditionalValidation, {
    message: createStrValidationPhoneErrorMessage,
  })
  @IsNotTogetherWith('email', {
    message: 'либо телефон, либо email',
  })
  declare phone?: string;

  @ApiProperty({
    description: 'email. Обязателен, если не указан phone',
    maxLength: 150,
    required: false,
  })
  @ValidateIf((o) => !isBlankValue(o.email) || isBlankValue(o.phone))
  @Transform(transformTrimString)
  @MaxLength(150)
  @IsEmail({}, { message: 'Некорректный email' })
  declare email?: string;

  @ApiProperty({
    description: 'Канал доставки кода',
    enum: ALLOWED_CODE_CHANNELS,
  })
  @Transform(transformTrimString)
  @MaxLength(50)
  @IsString({ message: createStrValidationErrorMessage })
  @IsIn(ALLOWED_CODE_CHANNELS, {
    message: `channel должен быть одним из: ${ALLOWED_CODE_CHANNELS.join(', ')}`,
  })
  declare channel: string;
}

export class SignInCodeRequestDto {
  @ApiProperty({
    description: 'Номер телефона 7+10 цифр номера. Обязателен, если не указан email',
    maxLength: 50,
    required: false,
  })
  @ValidateIf((o) => !isBlankValue(o.phone) || isBlankValue(o.email))
  @Transform(transformTrimString)
  @MaxLength(50)
  @Validate(PhoneAdditionalValidation, {
    message: createStrValidationPhoneErrorMessage,
  })
  @IsNotTogetherWith('email', {
    message: 'Укажите либо телефон, либо email',
  })
  declare phone?: string;

  @ApiProperty({
    description: 'Email. Обязателен, если не указан phone',
    maxLength: 150,
    required: false,
  })
  @ValidateIf((o) => !isBlankValue(o.email) || isBlankValue(o.phone))
  @Transform(transformTrimString)
  @MaxLength(150)
  @IsEmail({}, { message: 'Некорректный email' })
  declare email?: string;

  @ApiProperty({ description: 'Проверочный код' })
  @IsNumber({}, { message: createAuthCodeErrorMessage })
  @Validate(AuthNumberValidation)
  declare code: number;
}

export class CheckEmailRequestDto {
  @ApiProperty({ description: 'Email для проверки доступности', maxLength: 150 })
  @Transform(transformTrimString)
  @MaxLength(150)
  @IsEmail({}, { message: 'Некорректный email' })
  declare email: string;
}

export class SuggestNicknameRequestDto {
  @ApiProperty({
    description: 'Имя, на основе которого подбирается свободный никнейм',
    maxLength: 255,
  })
  @Transform(transformTrimString)
  @MinLength(1)
  @MaxLength(255)
  @IsString({ message: createStrValidationErrorMessage })
  declare name: string;
}
