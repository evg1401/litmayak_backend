import { BookCharacters } from '@models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookCharactersService } from '@/profile/book_characters/book_characters.service';
import { BookCharactersController } from '@/profile/book_characters/book_characters.controller';
import { BooksModule } from '@/books/books.module';
import { AuthorsModule } from '../authors/authors.module';

@Module({
  imports: [
    SequelizeModule.forFeature([BookCharacters]),
    BooksModule,
    AuthorsModule,
  ],
  controllers: [BookCharactersController],
  providers: [BookCharactersService],
  exports: [BookCharactersService],
})
export class BookCharactersModule {}
