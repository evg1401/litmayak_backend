import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, sign, TokenExpiredError, verify } from 'jsonwebtoken';

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
      secret: configService.get('JWT_SECRET') ?? 'uytfgc',
      accessExpiresIn: parseInt(
        configService.get('JWT_ACCESS_EXPIRES_IN') ?? '900',
        10,
      ),
      refreshExpiresIn: parseInt(
        configService.get('JWT_REFRESH_EXPIRES_IN') ?? '302400',
        10,
      ),
      iss: configService.get('JWT_ISS') ?? '',
    },
    authCode: {
      maxNumberCodeAttempts: 3,
      recievedAuthCodeLifetime: 300, // сек
      authCodeInterval: 60, // сек
    },
    cookie: {
      cookieDomain: toAsciiDomain(
        configService.get('COOKIE_DOMAIN') ?? 'localhost',
      ),
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
    if (e instanceof TokenExpiredError) {
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
