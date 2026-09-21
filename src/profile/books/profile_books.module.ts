import { Authors, Books, PublishingHouses } from '@models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProfileBooksController } from '@/profile/books/profile_books.controller';
import { ProfileBooksService } from './profile_books.service';

@Module({
  imports: [SequelizeModule.forFeature([Books, Authors, PublishingHouses])],
  controllers: [ProfileBooksController],
  providers: [ProfileBooksService],
})
export class ProfileBooksModule {}
