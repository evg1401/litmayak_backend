import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsNumber, Max, Min } from 'class-validator';

export const READING_FONT_FAMILIES = ['georgia', 'inter', 'palatino', 'times'] as const;
export const READING_THEMES = ['light', 'sepia', 'dark', 'night'] as const;
export const READING_MARGINS = ['narrow', 'medium', 'wide'] as const;
export const READING_SCROLL_MODES = ['scroll', 'paginate'] as const;
export const READING_LINE_HEIGHTS = [1.5, 1.8, 2, 2.4] as const;

export class UpdateReadingSettingsRequestDto {
  @ApiProperty({ description: 'размер шрифта, px', required: false, minimum: 14, maximum: 32 })
  @IsOptional()
  @IsInt()
  @Min(14)
  @Max(32)
  declare fontSize?: number;

  @ApiProperty({ description: 'межстрочный интервал', required: false, enum: READING_LINE_HEIGHTS })
  @IsOptional()
  @IsNumber()
  @IsIn(READING_LINE_HEIGHTS)
  declare lineHeight?: number;

  @ApiProperty({ description: 'шрифт', required: false, enum: READING_FONT_FAMILIES })
  @IsOptional()
  @IsIn(READING_FONT_FAMILIES)
  declare fontFamily?: string;

  @ApiProperty({ description: 'тема читалки', required: false, enum: READING_THEMES })
  @IsOptional()
  @IsIn(READING_THEMES)
  declare theme?: string;

  @ApiProperty({ description: 'отступы', required: false, enum: READING_MARGINS })
  @IsOptional()
  @IsIn(READING_MARGINS)
  declare margin?: string;

  @ApiProperty({ description: 'прокрутка текста', required: false, enum: READING_SCROLL_MODES })
  @IsOptional()
  @IsIn(READING_SCROLL_MODES)
  declare scrollMode?: string;
}
