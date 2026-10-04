import { NewsletterSubscriptions } from '@models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';

@Module({
  imports: [SequelizeModule.forFeature([NewsletterSubscriptions])],
  controllers: [NewsletterController],
  providers: [NewsletterService],
})
export class NewsletterModule {}
