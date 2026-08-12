import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class DeviceUidMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      res.locals.deviceUid = req.get('Device-Uid')?.trim() ?? null;

      next();
    } catch (error) {
      res.locals.deviceUid = null;
      next();
    }
  }
}
