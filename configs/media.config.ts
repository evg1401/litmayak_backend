import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isURL } from 'class-validator';
import { randomInt } from 'crypto';
import { getS3Opts, S3Opts } from './s3.config';

export interface MediaOpts {
  allowedHosts: string[];
}

export const UPLOAD_CATEGORIES = ['avatars', 'books', 'posts'] as const;
export type UploadCategory = (typeof UPLOAD_CATEGORIES)[number];

export const ALLOWED_UPLOAD_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
] as const;

const PERSONAL_ID_PATTERN = '[0-9a-f]{64}';
const MEDIA_NAME_CHARS =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const MEDIA_NAME_LENGTH = 12;
const MEDIA_NAME_PATTERN = '[A-Za-z0-9]+';

export const mediaOwnerPrefix = (personalId: string): string =>
  `${personalId}/`;

const randomMediaName = (): string => {
  let name = '';
  for (let i = 0; i < MEDIA_NAME_LENGTH; i++) {
    name += MEDIA_NAME_CHARS[randomInt(MEDIA_NAME_CHARS.length)];
  }

  return name;
};

export const buildMediaKey = (
  personalId: string,
  category: UploadCategory,
  extension: string,
): string =>
  `${mediaOwnerPrefix(personalId)}${category}/${randomMediaName()}.${extension}`;

// формат ключа: <personalId>/<category>/<name>.<ext>
export const mediaKeyPattern = (
  categories: readonly UploadCategory[] = UPLOAD_CATEGORIES,
): RegExp =>
  new RegExp(
    `^${PERSONAL_ID_PATTERN}/(${categories.join('|')})/${MEDIA_NAME_PATTERN}\\.(${ALLOWED_UPLOAD_EXTENSIONS.join('|')})$`,
  );

// хост бакета
let allowedMediaHosts: string[] = [];

export const getAllowedMediaHosts = (): string[] => allowedMediaHosts;

export const buildMediaHost = ({
  bucket,
  hostSuffix,
}: Pick<S3Opts, 'bucket' | 'hostSuffix'>): string => `${bucket}.${hostSuffix}`;

const isMediaHost = (hostname: string): boolean =>
  allowedMediaHosts.includes(hostname.toLowerCase());

export const hasScheme = (value: string): boolean =>
  /^[a-z][a-z0-9+.-]*:/i.test(value);

export const isMediaUrl = (value: unknown): boolean => {
  if (
    typeof value !== 'string' ||
    !isURL(value, { protocols: ['https'], require_protocol: true })
  ) {
    return false;
  }

  try {
    return isMediaHost(new URL(value).hostname);
  } catch {
    return false;
  }
};

export const toMediaUrl = <T extends string | null | undefined>(
  value: T,
): T => {
  if (!value || hasScheme(value)) return value;

  const path = value
    .replace(/^\/+/, '')
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');

  return `https://${allowedMediaHosts[0]}/${path}` as T;
};

export const toMediaUrls = <T extends string[] | null | undefined>(
  values: T,
): T => (Array.isArray(values) ? values.map(toMediaUrl) : values) as T;

export const toMediaKey = (value: string): string => {
  try {
    const url = new URL(value);
    if (!isMediaHost(url.hostname)) return value;

    return decodeURIComponent(url.pathname.replace(/^\/+/, ''));
  } catch {
    return value;
  }
};

export const mediaConfigProvider: Provider<MediaOpts> = {
  provide: 'MEDIA_CONFIG',
  useFactory: (configService: ConfigService) => {
    allowedMediaHosts = [
      buildMediaHost(getS3Opts(configService)).toLowerCase(),
    ];

    return { allowedHosts: allowedMediaHosts };
  },
  inject: [ConfigService],
};
