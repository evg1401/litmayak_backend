import { transformTrimString } from '@/helpers';
import { IsMediaKey } from '@/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class SavePostRequestDto {
  @ApiProperty({ description: 'текст поста', required: false, maxLength: 5000 })
  @Transform(transformTrimString)
  @IsOptional()
  @MaxLength(5000)
  @IsString()
  declare text?: string;

  @ApiProperty({
    description: 'тип вложения',
    required: false,
    enum: ['book', 'chapter', 'series'],
  })
  @IsOptional()
  @IsIn(['book', 'chapter', 'series'])
  declare attachmentType?: 'book' | 'chapter' | 'series';

  @ApiProperty({
    description: 'id книги - обязателен при attachmentType=book',
    required: false,
  })
  @ValidateIf((o) => o.attachmentType === 'book')
  @IsInt()
  declare bookId?: number;

  @ApiProperty({
    description: 'id главы - обязателен при attachmentType=chapter',
    required: false,
  })
  @ValidateIf((o) => o.attachmentType === 'chapter')
  @IsInt()
  declare bookCharacterId?: number;

  @ApiProperty({
    description:
      'название серии - обязательно при attachmentType=series (своей таблицы серий в проекте нет)',
    required: false,
    maxLength: 255,
  })
  @ValidateIf((o) => o.attachmentType === 'series')
  @Transform(transformTrimString)
  @IsString()
  @MaxLength(255)
  declare seriesTitle?: string;

  @ApiProperty({
    description:
      'ключи изображений в хранилище (key из POST profile/uploads/presign), до 4 штук',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @MaxLength(2048, { each: true })
  @IsMediaKey('posts', { each: true })
  declare images?: string[];
}

export class CreatePostCommentRequestDto {
  @ApiProperty({ description: 'текст комментария', maxLength: 2000 })
  @Transform(transformTrimString)
  @MinLength(1)
  @MaxLength(2000)
  @IsString()
  declare text: string;
}

export class CreatePostRepostRequestDto {
  @ApiProperty({
    description: 'свой комментарий к репосту',
    required: false,
    maxLength: 2000,
  })
  @Transform(transformTrimString)
  @IsOptional()
  @MaxLength(2000)
  @IsString()
  declare comment?: string;
}
