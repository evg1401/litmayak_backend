import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const DeviceUid = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getResponse()?.locals?.deviceUid ?? null,
);
