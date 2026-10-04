import { ReadingSettings } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UpdateReadingSettingsRequestDto } from './dto/reading_settings.request.dto';

export interface ReadingSettingsView {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  theme: string;
  margin: string;
  scrollMode: string;
}

const DEFAULTS: ReadingSettingsView = {
  fontSize: 18,
  lineHeight: 1.8,
  fontFamily: 'georgia',
  theme: 'light',
  margin: 'medium',
  scrollMode: 'scroll',
};

function present(row: ReadingSettings | null): ReadingSettingsView {
  if (!row) return { ...DEFAULTS };
  return {
    fontSize: row.fontSize,
    lineHeight: Number(row.lineHeight),
    fontFamily: row.fontFamily,
    theme: row.theme,
    margin: row.margin,
    scrollMode: row.scrollMode,
  };
}

@Injectable()
export class ReadingSettingsService {
  constructor(
    @InjectModel(ReadingSettings)
    protected model: typeof ReadingSettings,
  ) {}

  async getSettings(userId: number): Promise<ReadingSettingsView> {
    const row = await this.model.findOne({ where: { userId } });
    return present(row);
  }

  async updateSettings(
    userId: number,
    changes: UpdateReadingSettingsRequestDto,
  ): Promise<ReadingSettingsView> {
    const [row] = await this.model.findOrCreate({
      where: { userId },
      defaults: { userId, ...DEFAULTS },
    });
    await row.update(changes);
    return present(row);
  }
}
