import {
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { AbilityFactory } from '@/ability/ability.factory';
import { JwtTypes, validateJwt, type AuthOpts } from 'configs/jwt.config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private abilityFactory: AbilityFactory,
    @Inject('AUTH_CONFIG') private authConfig: AuthOpts,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const at = req?.get('Authorization')?.replace('Bearer', '').trim();

      if (!at) throw new Error('Ошибка авторизации. Авторизуйтесь заново');

      const payload = validateJwt(
        at,
        this.authConfig.jwt.secret,
        JwtTypes.Access,
      ) as JwtPayload | null;

      if (!payload) throw new Error('Ошибка авторизации. Авторизуйтесь заново');

      const ability = await this.abilityFactory.defineAbility(
        payload['roleId'],
        payload['userId'],
      );

      res.locals.user = {
        userId: payload['userId'],
        ability,
      };

      next();
    } catch (e) {
      if (e instanceof Error) {
        throw new UnauthorizedException(e.message);
      }
    }
  }
}
