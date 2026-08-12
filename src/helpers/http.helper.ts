import { HttpStatus } from '@nestjs/common';

type HttpExept = {
  result: any;
  statusCode: HttpStatus;
  error?: string;
};

// export const newHttpExept = ({ result, statusCode, error }: HttpExept) => {
//   throw new HttpException(
//     {
//       result,
//       status_code: statusCode,
//       error: error ?? null,
//     },
//     statusCode,
//   );
// };

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
