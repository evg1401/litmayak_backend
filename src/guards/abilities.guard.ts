import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  CHECK_ABILITIES_KEY,
  RequiredRule,
} from '@/decorators/check_abilities.decorator';
import type { IUserLocals } from 'libs/interfaces';

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rules = this.reflector.getAllAndOverride<RequiredRule[]>(
      CHECK_ABILITIES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rules?.length) {
      return true;
    }

    const userLocals = context.switchToHttp().getResponse().locals
      ?.user as IUserLocals | undefined;

    if (!userLocals?.ability) {
      throw new ForbiddenException('Недостаточно прав');
    }

    const { ability } = userLocals;
    const allowed = rules.every((rule) =>
      ability.can(rule.action, rule.subject),
    );

    if (!allowed) {
      throw new ForbiddenException('Недостаточно прав');
    }

    return true;
  }
}
