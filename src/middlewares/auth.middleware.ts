import {
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { AbilityFactory } from '@/ability/ability.factory';
import { UsersService } from '@/profile/users/users.service';
import { JwtTypes, validateJwt, type AuthOpts } from 'configs/jwt.config';
import { getErrorMessage } from '@/helpers';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private abilityFactory: AbilityFactory,
    private usersService: UsersService,
    @Inject('AUTH_CONFIG') private authConfig: AuthOpts,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const at = req?.get('Authorization')?.replace('Bearer', '').trim();

      if (!at) throw new Error('Ошибка авторизации. Авторизуйтесь заново');

      const payload = validateJwt(
        at,
        this.authConfig.jwt.secret,
        this.authConfig.jwt.iss,
        JwtTypes.Access,
      ) as JwtPayload | null;

      if (!payload) throw new Error('Ошибка авторизации. Авторизуйтесь заново');

      const roleId =
        (await this.usersService.getRoleId(payload['userId'])) ??
        payload['roleId'];

      const ability = await this.abilityFactory.defineAbility(
        roleId,
        payload['userId'],
      );

      res.locals.user = {
        userId: payload['userId'],
        ability,
      };

      next();
    } catch (e) {
      if (e instanceof Error) {
        throw new UnauthorizedException(getErrorMessage(e));
      }
    }
  }
}
