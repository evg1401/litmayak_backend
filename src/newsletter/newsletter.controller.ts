import { getErrorMessage, httpExeptHandler } from '@/helpers';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'dto/response.dto';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterRequestDto } from './dto/newsletter.request.dto';

@ApiTags('Рассылка')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @ApiOperation({ summary: 'подписаться на рассылку' })
  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: false, whitelist: true }))
  async subscribe(
    @Body() request: SubscribeNewsletterRequestDto,
  ): Promise<ResponseDto<boolean>> {
    try {
      await this.newsletterService.subscribe(request.email);
      return { result: true };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }
}
