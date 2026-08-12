import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUserLocals } from 'libs/interfaces';

export const UserLocals = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IUserLocals | null =>
    ctx.switchToHttp().getResponse().locals?.user ?? {},
);
