import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  UPLOAD_CATEGORIES,
  type UploadCategory,
} from 'configs/media.config';

export { ALLOWED_UPLOAD_EXTENSIONS, UPLOAD_CATEGORIES };
export type { UploadCategory };

export class PresignUploadRequestDto {
  @ApiProperty({
    description: 'раздел хранилища - определяет папку',
    enum: UPLOAD_CATEGORIES,
  })
  @IsIn(UPLOAD_CATEGORIES)
  declare category: UploadCategory;

  @ApiProperty({
    description: 'расширение файла без точки',
    enum: ALLOWED_UPLOAD_EXTENSIONS,
  })
  @IsIn(ALLOWED_UPLOAD_EXTENSIONS, {
    message: `extension должно быть одним из: ${ALLOWED_UPLOAD_EXTENSIONS.join(', ')}`,
  })
  declare extension: string;
}
