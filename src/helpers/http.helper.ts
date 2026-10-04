import { HttpException, Logger } from '@nestjs/common';

const INTERNAL_ERROR_MESSAGE = 'Произошла ошибка при обработке запроса';

const errorLogger = new Logger('RequestError');

export const getErrorMessage = (e: Error): string => {
  if (e instanceof HttpException) return e.message;

  const isAppError = e.constructor === Error && !('code' in e);
  if (isAppError) return e.message;

  errorLogger.error(e.message, e.stack);

  return INTERNAL_ERROR_MESSAGE;
};

export const httpExeptHandler = (e: unknown) => {
  Object.assign({ result: null }, e);

  return e;
};

export const setCookie = (
  response: Response,
  key: string,
  value: string,
  path: string,
  maxAge: number,
  cookieDomain: string,
) => {
  // @ts-ignore
  response.cookie(key, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'test',
    sameSite: 'lax',
    maxAge,
    path,
    domain: cookieDomain,
  });
};
