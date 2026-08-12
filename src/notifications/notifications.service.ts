import { Injectable } from '@nestjs/common';
import { Channels } from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  async send(
    channel: Channels,
    phone: string,
    message: string,
  ): Promise<boolean> {
    switch (channel) {
      case Channels.telegram:
        return this.sendTelegramMsg(phone, message);

      case Channels.max:
        return this.sendMaxMsg(phone, message);
      case Channels.sms:
        return this.sendSmsMsg(phone, message);
    }
  }

  private async sendTelegramMsg(
    phone: string,
    message: string,
  ): Promise<boolean> {
    return true;
  }

  private async sendMaxMsg(phone: string, message: string): Promise<boolean> {
    return true;
  }

  private async sendSmsMsg(phone: string, message: string): Promise<boolean> {
    return true;
  }
}
