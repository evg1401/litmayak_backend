import { Injectable } from '@nestjs/common';
import { AuthCodeEvents } from '@models';
import { InjectModel } from '@nestjs/sequelize';
import { AuthLog, AuthLogPending } from './dto/auth_code_events.dto';

@Injectable()
export class AuthCodeEventsService {
  constructor(
    @InjectModel(AuthCodeEvents)
    protected authCodeEventsRepository: typeof AuthCodeEvents,
  ) {}

  async getLastItemByNotifyType(
    phone: string,
    notifyType: string,
    deviceUid: string,
  ): Promise<Exclude<AuthCodeEvents, 'id'> | null> {
    const result = await this.authCodeEventsRepository.findOne({
      attributes: { exclude: ['id'] },
      where: {
        phone,
        deviceUid,
        notifyType,
      },
    });

    return result;
  }

  async AddAuthLog(log: AuthLog): Promise<AuthCodeEvents> {
    return this.authCodeEventsRepository.create(log);
  }

  async updateStatusAuthLog(
    phone: string,
    deviceUid: string,
    status: string,
    errorMessage: string,
  ): Promise<number[]> {
    return this.authCodeEventsRepository.update(
      { status, errorMessage },
      {
        where: {
          phone,
          deviceUid,
          status: AuthLogPending.Pending,
        },
      },
    );
  }
}
