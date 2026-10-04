import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class FollowAuthorRequestDto {
  @ApiProperty({ description: 'id автора' })
  @IsInt()
  declare authorId: number;
}
