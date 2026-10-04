import { Books, BookTopRating } from '@models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookTopRatingController } from './book_top_rating.controller';
import { BookTopRatingService } from './book_top_rating.service';

@Module({
  imports: [SequelizeModule.forFeature([BookTopRating, Books])],
  controllers: [BookTopRatingController],
  providers: [BookTopRatingService],
})
export class BookTopRatingModule {}
