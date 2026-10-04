import { registerDecorator, ValidationOptions } from 'class-validator';
import {
  isMediaUrl,
  mediaKeyPattern,
  UPLOAD_CATEGORIES,
  UploadCategory,
} from 'configs/media.config';

export { isMediaUrl };

export function IsMediaKey(
  categories: UploadCategory | readonly UploadCategory[] = UPLOAD_CATEGORIES,
  options?: ValidationOptions,
) {
  const list = typeof categories === 'string' ? [categories] : categories;
  const pattern = mediaKeyPattern(list);

  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isMediaKey',
      target: object.constructor,
      propertyName,
      options: {
        message: `Параметр ${propertyName} должен быть ключом файла из хранилища (${list.join(', ')})`,
        ...options,
      },
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' &&
          (pattern.test(value) || isMediaUrl(value)),
      },
    });
  };
}

export function IsMediaUrl(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isMediaUrl',
      target: object.constructor,
      propertyName,
      options: {
        message: `Параметр ${propertyName} должен быть https-ссылкой на хранилище проекта`,
        ...options,
      },
      validator: { validate: isMediaUrl },
    });
  };
}
