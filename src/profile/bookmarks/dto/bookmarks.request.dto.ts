import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class UpsertBookmarkRequestDto {
  @ApiProperty({ description: 'id книги' })
  @IsInt()
  declare bookId: number;

  @ApiProperty({ description: 'id главы' })
  @IsInt()
  declare chapterId: number;
}
