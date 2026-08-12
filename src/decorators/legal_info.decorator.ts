import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'eqLengthNumberValidation', async: false })
export class EqLengthNumberValidation implements ValidatorConstraintInterface {
  validate(num: number, args: ValidationArguments): boolean {
    const [expectedLength] = args.constraints;

    if (num <= 0 || String(num).length !== expectedLength) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const [expectedLength] = args.constraints;

    return `Введен некорректный номер: номер должен быть ${expectedLength}-значным`;
  }
}

// Фабрика с параметрами
export function IsEqLengthNumber(expectedLength: number, options?: ValidationOptions & { message?: string }) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'eqLengthNumberValidation',
      target: object.constructor,
      propertyName: propertyName,
      options: options,
      constraints: [expectedLength, options?.message || 'Введен некорректный номер'],
      validator: EqLengthNumberValidation,
    });
  };
}