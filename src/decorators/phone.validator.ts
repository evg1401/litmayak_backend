import { validPhoneDeep } from '@/helpers';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'phoneAdditionalValidation', async: false })
export class PhoneAdditionalValidation implements ValidatorConstraintInterface {
  validate(phone: string, args: ValidationArguments): boolean {
    if (!phone) return false;

    return validPhoneDeep(phone);
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Номер телефона содержит недопустимую комбинацию цифр';
  }
}

@ValidatorConstraint({ name: 'authNumberValidation', async: false })
export class AuthNumberValidation implements ValidatorConstraintInterface {
  validate(code: number, args: ValidationArguments): boolean {
    if (code <= 0 || String(code).length !== 4) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    return `Введен некорректный проверочный код`;
  }
}
