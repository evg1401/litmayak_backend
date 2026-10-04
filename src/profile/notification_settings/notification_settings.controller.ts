import { getErrorMessage, httpExeptHandler } from '@/helpers';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'dto/response.dto';
import type { IUserLocals } from 'libs/interfaces';
import { UserLocals } from '@/decorators';
import { NotificationSettingsService } from './notification_settings.service';
import { UpdateNotificationSettingsRequestDto } from './dto/notification_settings.request.dto';

@ApiTags('Уведомления')
@Controller('profile/notifications')
export class NotificationSettingsController {
  constructor(
    private readonly notificationSettingsService: NotificationSettingsService,
  ) {}

  @ApiOperation({ summary: 'настройки уведомлений (вкладка "Автор")' })
  @Get()
  async getSettings(
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<Record<string, boolean>>> {
    try {
      const result = await this.notificationSettingsService.getSettings(
        userId,
      );
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'обновить настройки уведомлений' })
  @Patch()
  @UsePipes(new ValidationPipe({ transform: false, whitelist: true }))
  async updateSettings(
    @Body() request: UpdateNotificationSettingsRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<Record<string, boolean>>> {
    try {
      const result = await this.notificationSettingsService.updateSettings(
        userId,
        request.settings,
      );
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }
}
