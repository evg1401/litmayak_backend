import { BookCharacters } from '@models';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookCharactersService } from '@/profile/book_characters/book_characters.service';
import { BookCharactersController } from '@/profile/book_characters/book_characters.controller';
import { BooksModule } from '@/books/books.module';
import { AuthorsModule } from '../authors/authors.module';
import { MulterModule } from '@nestjs/platform-express';
import {
  documentsConfigProvider,
  documentsMulterOptions,
} from 'configs/documents.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `envs/.env`,
    }),
    SequelizeModule.forFeature([BookCharacters]),
    BooksModule,
    AuthorsModule,
    MulterModule.registerAsync(documentsMulterOptions),
  ],
  controllers: [BookCharactersController],
  providers: [BookCharactersService, documentsConfigProvider],
  exports: [BookCharactersService, 'DOCUMENTS_CONFIG'],
})
export class BookCharactersModule {}
