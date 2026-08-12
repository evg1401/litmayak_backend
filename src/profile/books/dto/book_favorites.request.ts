import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNumber } from 'class-validator';

export class AddBookFavoritesRequestDto {
  @ApiProperty({ description: 'id книги' })
  @IsInt()
  declare bookId: number;
}

export class DeleteBatchBookFavoritesRequestDto {
  @ApiProperty({ description: 'массив id книг' })
  @IsArray()
  @IsNumber({}, { each: true })
  declare ids: number[];
}
