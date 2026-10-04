import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtPayload, sign, verify } from 'jsonwebtoken';
import { getEnv, getIntEnv } from './helpers';

export interface AuthOpts {
  jwt: {
    secret: string;
    accessExpiresIn: number;
    refreshExpiresIn: number;
    iss: string;
  };
  authCode: {
    maxNumberCodeAttempts: number;
    recievedAuthCodeLifetime: number;
    authCodeInterval: number;
    maxFailedSignIns: number;
    failedSignInWindow: number;
    maxCodesPerIdentifier: number;
    codesPerIdentifierWindow: number;
  };
  cookie: {
    cookieDomain: string;
  };
}

export type JwtTokens = {
  access: string;
  refresh: string;
};

export enum JwtTypes {
  Refresh = 'refresh',
  Access = 'access',
}

const toAsciiDomain = (domain: string): string => {
  if (!domain) return domain;

  const hasLeadingDot = domain.startsWith('.');
  const { hostname } = new URL(
    `https://${hasLeadingDot ? domain.slice(1) : domain}`,
  );

  return hasLeadingDot ? `.${hostname}` : hostname;
};

export const authConfigProvider: Provider<AuthOpts> = {
  provide: 'AUTH_CONFIG',
  useFactory: (configService: ConfigService) => ({
    jwt: {
      secret: getEnv('JWT_SECRET', configService),
      accessExpiresIn: getIntEnv('JWT_ACCESS_EXPIRES_IN', configService),
      refreshExpiresIn: getIntEnv('JWT_REFRESH_EXPIRES_IN', configService),
      iss: getEnv('JWT_ISS', configService),
    },
    authCode: {
      maxNumberCodeAttempts: 3,
      recievedAuthCodeLifetime: 300,
      authCodeInterval: 60,
      // неверных вводов кода на пользователя за окно
      maxFailedSignIns: 5,
      failedSignInWindow: 20 * 60,
      // отправка кода за окно
      maxCodesPerIdentifier: 8,
      codesPerIdentifierWindow: 60 * 60,
    },
    cookie: {
      cookieDomain: toAsciiDomain(getEnv('COOKIE_DOMAIN', configService)),
    },
  }),
  inject: [ConfigService],
};

export const validateJwt = (
  jwt: string,
  jwtSecret: string,
  iss: string,
  tokenType: string,
): string | JwtPayload | null => {
  try {
    const payload = verify(jwt, jwtSecret);

    if (
      !payload?.['userId'] ||
      payload?.['iss'] !== iss ||
      payload?.['aud'] !== tokenType
    ) {
      return null;
    }

    return payload;
  } catch (e) {
    if (e instanceof JsonWebTokenError) {
      return null;
    }

    throw e;
  }
};

export const generateJwt = (
  payload: JwtPayload,
  jwtType: string,
  jwtSecret: string,
  expiresIn: number,
) => {
  return sign(payload, jwtSecret, { expiresIn, audience: jwtType });
};
