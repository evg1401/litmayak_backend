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
import {
  ReadingSettingsService,
  ReadingSettingsView,
} from './reading_settings.service';
import { UpdateReadingSettingsRequestDto } from './dto/reading_settings.request.dto';

@ApiTags('Настройки чтения')
@Controller('profile/reading-settings')
export class ReadingSettingsController {
  constructor(
    private readonly readingSettingsService: ReadingSettingsService,
  ) {}

  @ApiOperation({ summary: 'настройки читалки' })
  @Get()
  async getSettings(
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<ReadingSettingsView>> {
    try {
      const result = await this.readingSettingsService.getSettings(userId);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'обновить настройки читалки' })
  @Patch()
  @UsePipes(
    new ValidationPipe({ transform: true, whitelist: true }),
  )
  async updateSettings(
    @Body() request: UpdateReadingSettingsRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<ReadingSettingsView>> {
    try {
      const result = await this.readingSettingsService.updateSettings(
        userId,
        request,
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
