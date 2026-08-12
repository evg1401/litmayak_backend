import { AppLogger } from '@/logger/logger.service';

export const logErr = (logger: AppLogger, msg: string, err: unknown) => {
  logger.error(msg, err instanceof Error ? err.stack : String(err));
};
