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
