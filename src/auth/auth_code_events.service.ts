import { Injectable } from '@nestjs/common';
import { AuthCodeEvents } from '@models';
import { InjectModel } from '@nestjs/sequelize';
import { col, fn, Op, Transaction, where } from 'sequelize';
import { AuthLog, AuthLogPending } from './dto/auth_code_events.dto';
import { AdvisoryLockNamespace, lockByKey } from '@/helpers';

const CODE_ISSUE_EVENTS = ['generate_code', 'refresh_code'];
const SIGN_IN_FAILED_EVENT = 'signin_failed';
const SIGN_IN_NOTIFY_TYPE = 'signin';

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
      order: [['created_at', 'DESC']],
    });

    return result;
  }

  async AddAuthLog(log: AuthLog): Promise<AuthCodeEvents> {
    return this.authCodeEventsRepository.create(log);
  }

  async reserveCodeIssue(
    log: AuthLog,
    max: number,
    windowSec: number,
  ): Promise<boolean> {
    const sequelize = this.authCodeEventsRepository.sequelize!;
    const identifier = log.phone.toLowerCase();

    return sequelize.transaction(async (transaction) => {
      await lockByKey(
        sequelize,
        AdvisoryLockNamespace.CodeIssue,
        identifier,
        transaction,
      );

      const issued = await this.authCodeEventsRepository.count({
        where: {
          [Op.and]: [
            where(fn('lower', col('phone')), identifier),
            {
              eventType: { [Op.in]: CODE_ISSUE_EVENTS },
              status: { [Op.ne]: AuthLogPending.Failed },
              createdAt: { [Op.gt]: new Date(Date.now() - windowSec * 1000) },
            },
          ],
        },
        transaction,
      });

      if (issued >= max) {
        return false;
      }

      await this.authCodeEventsRepository.create(log, { transaction });

      return true;
    });
  }

  async getRecentSignInFailures(
    userKey: string,
    windowSec: number,
    limit: number,
    transaction: Transaction,
  ): Promise<Date[]> {
    const rows = await this.authCodeEventsRepository.findAll({
      attributes: ['createdAt'],
      where: {
        phone: userKey,
        eventType: SIGN_IN_FAILED_EVENT,
        createdAt: { [Op.gt]: new Date(Date.now() - windowSec * 1000) },
      },
      order: [['created_at', 'DESC']],
      limit,
      transaction,
    });

    return rows.map((row) => row.createdAt as Date);
  }

  async addSignInFailure(
    userKey: string,
    deviceUid: string,
    transaction: Transaction,
  ): Promise<void> {
    await this.authCodeEventsRepository.create(
      {
        phone: userKey,
        deviceUid,
        notifyType: SIGN_IN_NOTIFY_TYPE,
        eventType: SIGN_IN_FAILED_EVENT,
        status: AuthLogPending.Failed,
      },
      { transaction },
    );
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
