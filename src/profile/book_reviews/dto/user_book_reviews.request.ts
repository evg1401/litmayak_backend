import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber } from 'class-validator';

export class CreateUserBookReviewRequestDto {
  @ApiProperty({ description: 'id книги' })
  @IsInt()
  declare bookId: number;

  @ApiProperty({ description: 'оценка' })
  @IsNumber()
  declare review: number;
}
