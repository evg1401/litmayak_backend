import { NAME_REGEX_PATTERN } from '@/common/constants/regex.constants';
import { transformTrimString } from '@/helpers';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateOrUpdateBookCollectionRequestDto {
  @ApiProperty({ description: 'наименование коллекции', maxLength: 50 })
  @Transform(transformTrimString)
  @IsString()
  @MaxLength(50)
  @Matches(NAME_REGEX_PATTERN, {
    message:
      'наименование должно начинаться и оканчиваться кириллической или латинской буквой либо цифрой',
  })
  declare name: string;

  @ApiProperty({ description: 'сортировка' })
  @IsOptional()
  @IsInt()
  declare order: number;
}

// export class RenameBookCollectionRequestDto {
//   @ApiProperty({ description: 'новое наименование коллекции', maxLength: 50 })
//   @IsString()
//   @MaxLength(50)
//   @Matches(NAME_REGEX_PATTERN, {
//     message:
//       'наименование должно начинаться и оканчиваться кириллической или латинской буквой либо цифрой',
//   })
//   declare name: string;
// }

export class AddBookToCollectionRequestDto {
  @ApiProperty({ description: 'id коллекции книг' })
  @IsInt()
  declare bookCollectionId: number;

  @ApiProperty({ description: 'id книги' })
  @IsInt()
  declare bookId: number;

  @ApiProperty({ description: 'сортировка' })
  @IsOptional()
  @IsInt()
  declare order: number;
}

export class DeleteBatchBooksFromCollectionRequestDto {
  @ApiProperty({ description: 'id коллекции книг' })
  @IsInt()
  declare bookCollectionId: number;

  @ApiProperty({ description: 'массив id книг' })
  @IsArray()
  @IsNumber({}, { each: true })
  declare bookIds: number[];
}
