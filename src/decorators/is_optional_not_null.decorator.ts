import { ValidateIf, ValidationOptions } from 'class-validator';

/**
 * Аналог @IsOptional(), но пропускает только отсутствующие поля.
 *
 * @IsOptional() снимает валидацию и с undefined, и с null, поэтому явный null
 * проходит насквозь и попадает в БД. Здесь валидация пропускается только для
 * undefined — переданный null проверяется основными правилами поля и отклоняется.
 */
export const IsOptionalNotNull = (
  validationOptions?: ValidationOptions,
): PropertyDecorator =>
  ValidateIf((_object, value) => value !== undefined, validationOptions);
