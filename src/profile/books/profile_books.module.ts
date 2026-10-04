import {
  Authors,
  Books,
  BookCharacters,
  BookGenreMeta,
  BookGenres,
  PublishingHouses,
} from '@models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MulterModule } from '@nestjs/platform-express';
import { documentsMulterOptions } from 'configs/documents.config';
import { ProfileBooksController } from '@/profile/books/profile_books.controller';
import { ProfileBooksService } from './profile_books.service';
import { EpubImportService } from './epub_import.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Books,
      Authors,
      PublishingHouses,
      BookCharacters,
      BookGenres,
      BookGenreMeta,
    ]),
    MulterModule.registerAsync(documentsMulterOptions),
  ],
  controllers: [ProfileBooksController],
  providers: [ProfileBooksService, EpubImportService],
})
export class ProfileBooksModule {}
