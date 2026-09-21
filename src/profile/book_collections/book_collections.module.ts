import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookCollections, BookCollectionsMeta } from '@models';
import { BookCollectionMetaService } from '@/profile/book_collections/book_collection_meta.service';
import { BookCollectionsService } from '@/profile/book_collections/book_collections.service';
import { BooksModule } from '@/books/books.module';
import { BookCollectionsController } from '@/profile/book_collections/book_collections.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([BookCollections, BookCollectionsMeta]),
    BooksModule,
  ],
  controllers: [BookCollectionsController],
  providers: [BookCollectionMetaService, BookCollectionsService],
})
export class BookCollectionsModule {}
