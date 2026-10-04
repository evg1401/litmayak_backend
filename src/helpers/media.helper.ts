import { Users } from 'libs/models/users.model';
import { hasScheme, mediaOwnerPrefix, toMediaKey } from 'configs/media.config';

export const getPersonalId = async (userId: number): Promise<string | null> => {
  const user = await Users.findByPk(userId, { attributes: ['personalId'] });

  return user?.personalId ?? null;
};

// приводит значения к ключам
export const normalizeOwnMediaKeys = async (
  userId: number,
  values: string[],
): Promise<string[]> => {
  const keys = values.map(toMediaKey);
  const ownKeys = keys.filter((key) => !hasScheme(key));
  if (!ownKeys.length) return keys;

  const personalId = await getPersonalId(userId);
  const prefix = personalId ? mediaOwnerPrefix(personalId) : null;

  if (!prefix || ownKeys.some((key) => !key.startsWith(prefix))) {
    throw new Error('Файл должен быть загружен текущим пользователем');
  }

  return keys;
};

export const normalizeOwnMediaKey = async <T extends string | null | undefined>(
  userId: number,
  value: T,
): Promise<T> => {
  if (!value) return value;

  const [key] = await normalizeOwnMediaKeys(userId, [value]);
  return key as T;
};
