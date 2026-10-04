import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export const isBlankValue = (value: unknown): boolean =>
  value === undefined || value === null || value === '';

export function IsNotTogetherWith(
  relatedProperty: string,
  options?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotTogetherWith',
      target: object.constructor,
      propertyName,
      constraints: [relatedProperty],
      options,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const related = (args.object as Record<string, unknown>)[
            relatedProperty
          ];

          return isBlankValue(value) || isBlankValue(related);
        },
        defaultMessage(args: ValidationArguments): string {
          return `Параметры ${args.property} и ${relatedProperty} нельзя указывать одновременно`;
        },
      },
    });
  };
}
