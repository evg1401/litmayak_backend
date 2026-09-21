import { ValidateIf, ValidationOptions } from 'class-validator';

export const IsOptionalNotNull = (
  validationOptions?: ValidationOptions,
): PropertyDecorator =>
  ValidateIf((_object, value) => value !== undefined, validationOptions);
