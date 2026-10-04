import { Inject, Injectable } from '@nestjs/common';
import { Channels } from './dto/notifications.dto';
import { AppLogger } from '@/logger/logger.service';
import type { WappiOpts } from 'configs/wappi.config';
import type { UnisenderOpts } from 'configs/unisender.config';
import {
  AUTH_CODE_EMAIL_SUBJECT,
  buildAuthCodeEmail,
  buildAuthCodePlaintext,
} from './templates/auth_code.template';
import { format } from 'util';

const PROVIDER_REQUEST_TIMEOUT_MS = 20_000;

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('WAPPI_CONFIG')
    private readonly wappiConfig: WappiOpts,
    @Inject('UNISENDER_CONFIG')
    private readonly unisenderConfig: UnisenderOpts,
    private readonly logger: AppLogger,
  ) {}

  async send(
    channel: Channels,
    recipient: string,
    message: string,
  ): Promise<boolean> {
    switch (channel) {
      case Channels.telegram:
        return this.sendTelegramMsg(recipient, message);

      case Channels.max:
        return this.sendMaxMsg(recipient, message);
      case Channels.sms:
        return this.sendSmsMsg(recipient, message);
      case Channels.email:
        return this.sendEmailMsg(recipient, message);
    }
  }

  private async sendTelegramMsg(
    phone: string,
    message: string,
  ): Promise<boolean> {
    const url = format(
      '%s/tapi/sync/message/send?profile_id=%s',
      this.wappiConfig.baseUrl,
      this.wappiConfig.tgProfileId,
    );

    const response = await this.fetchProvider(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.wappiConfig.token,
      },
      body: JSON.stringify({
        body: message,
        recipient: phone,
      }),
    });

    if (!response.ok) {
      const errResp = await response.text();

      this.logger.error(
        `Ощибка при отправке кода авторизации:  ${response.status} ${response.statusText}: ${errResp}`,
        errResp,
      );
      throw new Error('Ощибка при отправке кода авторизации');
    }

    return true;
  }

  private async sendMaxMsg(phone: string, message: string): Promise<boolean> {
    return true;
  }

  private async sendSmsMsg(phone: string, message: string): Promise<boolean> {
    return true;
  }

  private async sendEmailMsg(email: string, message: string): Promise<boolean> {
    const response = await this.fetchProvider(
      `${this.unisenderConfig.baseUrl}/email/send.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-API-KEY': this.unisenderConfig.token,
        },
        body: JSON.stringify({
          message: {
            recipients: [{ email }],
            subject: AUTH_CODE_EMAIL_SUBJECT,
            from_email: this.unisenderConfig.senderEmail,
            from_name: this.unisenderConfig.senderName,
            body: {
              html: buildAuthCodeEmail(message),
              plaintext: buildAuthCodePlaintext(message),
            },
            skip_unsubscribe: 0,
            track_links: 0,
            track_read: 0,
            template_engine: 'none',
          },
        }),
      },
    );

    const errResp = await this.getUnisenderError(response, email);
    if (errResp) {
      this.logger.error(
        `Ошибка при отправке кода авторизации на email: ${errResp}`,
        errResp,
      );
      throw new Error('Ошибка при отправке кода авторизации');
    }

    return true;
  }

  private async getUnisenderError(
    response: Response,
    email: string,
  ): Promise<string | null> {
    const text = await response.text();

    if (!response.ok) {
      return `${response.status} ${response.statusText}: ${text}`;
    }

    try {
      const data = JSON.parse(text) as {
        status?: string;
        failed_emails?: Record<string, string>;
      };

      if (data.status !== 'success') {
        return `некорректный ответ: ${text}`;
      }

      const failedReason = data.failed_emails?.[email];
      if (failedReason) {
        return `адрес не принят к отправке: ${failedReason}`;
      }

      return null;
    } catch {
      return `некорректный ответ: ${text}`;
    }
  }

  private async fetchProvider(
    url: string,
    init: RequestInit,
  ): Promise<Response> {
    try {
      return await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(PROVIDER_REQUEST_TIMEOUT_MS),
      });
    } catch (e) {
      const reason =
        e instanceof Error && e.name === 'TimeoutError'
          ? `нет ответа за ${PROVIDER_REQUEST_TIMEOUT_MS / 1000} сек`
          : e instanceof Error
            ? e.message
            : String(e);

      this.logger.error(
        `Ошибка при отправке кода авторизации: ${new URL(url).host}: ${reason}`,
        e instanceof Error ? e.stack : undefined,
      );
      throw new Error('Ошибка при отправке кода авторизации');
    }
  }
}
