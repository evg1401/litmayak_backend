import { Bookmarks, BookCharacters, Books } from '@models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';

@Module({
  imports: [SequelizeModule.forFeature([Bookmarks, Books, BookCharacters])],
  controllers: [BookmarksController],
  providers: [BookmarksService],
})
export class BookmarksModule {}
