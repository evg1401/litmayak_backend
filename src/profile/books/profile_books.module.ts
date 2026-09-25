import { Authors, Books, PublishingHouses } from '@models';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProfileBooksController } from '@/profile/books/profile_books.controller';
import { ProfileBooksService } from './profile_books.service';
import { BookCharactersModule } from '@/profile/book_characters/book_characters.module';
import { bookDocumentMulterOptions } from 'configs/documents.config';

@Module({
  imports: [
    SequelizeModule.forFeature([Books, Authors, PublishingHouses]),
    // настройка лимитов загрузки файла
    MulterModule.registerAsync(bookDocumentMulterOptions),
    BookCharactersModule,
  ],
  controllers: [ProfileBooksController],
  providers: [ProfileBooksService],
})
export class ProfileBooksModule {}
