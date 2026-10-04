import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpdateNotificationSettingsRequestDto {
  @ApiProperty({
    description:
      'карта "ключ тумблера → значение", например { "book_ratings": false }. Неизвестные ключи и не-boolean значения молча игнорируются.',
    example: { book_ratings: false, new_followers: true },
  })
  @IsObject()
  declare settings: Record<string, unknown>;
}
