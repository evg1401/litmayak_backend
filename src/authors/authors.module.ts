import { Authors, AuthorFollows, Books } from '@models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PublicAuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';

@Module({
  imports: [SequelizeModule.forFeature([Authors, Books, AuthorFollows])],
  controllers: [PublicAuthorsController],
  providers: [AuthorsService],
  exports: [AuthorsService],
})
export class PublicAuthorsModule {}
