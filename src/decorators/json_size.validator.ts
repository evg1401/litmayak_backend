import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'maxJsonSizeValidation', async: false })
export class MaxJsonSizeValidation implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const [maxBytes] = args.constraints as [number];

    let serialized: string;

    try {
      serialized = JSON.stringify(value) ?? '';
    } catch {
      return false;
    }

    return Buffer.byteLength(serialized, 'utf8') <= maxBytes;
  }

  defaultMessage(args: ValidationArguments): string {
    const [maxBytes] = args.constraints as [number];

    return `Параметр ${args.property} превышает допустимый размер ${maxBytes} байт`;
  }
}

// Фабрика с параметрами
export function MaxJsonSize(maxBytes: number, options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'maxJsonSizeValidation',
      target: object.constructor,
      propertyName: propertyName,
      options: options,
      constraints: [maxBytes],
      validator: MaxJsonSizeValidation,
    });
  };
}
