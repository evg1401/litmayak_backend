import { NewsletterSubscriptions } from '@models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(NewsletterSubscriptions)
    protected model: typeof NewsletterSubscriptions,
  ) {}

  async subscribe(email: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    await this.model.findOrCreate({
      where: { email: normalized },
      defaults: { email: normalized },
    });
  }
}
