import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookCollections, BookCollectionsMeta, Books } from '@models';
import { BookCollectionMetaService } from '@/profile/book_collections/book_collection_meta.service';
import { BookCollectionsService } from '@/profile/book_collections/book_collections.service';
import { BooksService } from '@/books/books.service';
import { BookCollectionsController } from '@/profile/book_collections/book_collections.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([BookCollections, BookCollectionsMeta, Books]),
  ],
  controllers: [BookCollectionsController],
  providers: [BookCollectionMetaService, BookCollectionsService, BooksService],
})
export class BookCollectionsModule {}
