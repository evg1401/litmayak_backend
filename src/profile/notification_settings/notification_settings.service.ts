import { NotificationSettings } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

export const NOTIFICATION_SETTINGS_DEFAULTS: Record<string, boolean> = {
  book_ratings: false,
  series_ratings: true,
  new_quotes: true,
  added_to_collections: true,

  new_followers: true,
  donations: true,
  post_likes: true,
  post_comments: true,

  comment_likes: true,
  journal_post_likes: true,

  payouts: true,
  moderation_results: true,
  platform_updates: false,
  email_notifications: false,
  disable_all: false,
};

@Injectable()
export class NotificationSettingsService {
  constructor(
    @InjectModel(NotificationSettings)
    protected model: typeof NotificationSettings,
  ) {}

  async getSettings(userId: number): Promise<Record<string, boolean>> {
    const rows = await this.model.findAll({
      where: { userId },
      attributes: ['key', 'enabled'],
    });

    const result = { ...NOTIFICATION_SETTINGS_DEFAULTS };
    for (const row of rows) {
      if (row.key in result) result[row.key] = row.enabled;
    }
    return result;
  }

  async updateSettings(
    userId: number,
    changes: Record<string, unknown>,
  ): Promise<Record<string, boolean>> {
    const entries = Object.entries(changes).filter(
      (entry): entry is [string, boolean] =>
        entry[0] in NOTIFICATION_SETTINGS_DEFAULTS &&
        typeof entry[1] === 'boolean',
    );

    for (const [key, enabled] of entries) {
      const [row, created] = await this.model.findOrCreate({
        where: { userId, key },
        defaults: { userId, key, enabled },
      });
      if (!created && row.enabled !== enabled) {
        row.enabled = enabled;
        await row.save();
      }
    }

    return this.getSettings(userId);
  }
}
