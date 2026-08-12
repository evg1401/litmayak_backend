import { httpExeptHandler } from '@/helpers';
import { PublishingHouses } from '@models';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'dto/response.dto';
import { PublishingHousesService } from '@/publishing_houses/publishing_houses.service';
import {
  CreatePublishingHousesRequestDto,
  UpdatePublishingHousesRequestDto,
} from './dto/publishing_houses.request.dto';

@ApiTags('Издательские дома')
@Controller('publishing-houses')
export class PublishingHousesController {
  constructor(
    private readonly publishingHousesService: PublishingHousesService,
  ) {}

  @ApiOperation({ summary: 'создать профиль издательского дома' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  async createPublishingHouse(
    @Body()
    request: CreatePublishingHousesRequestDto,
  ): Promise<ResponseDto<PublishingHouses>> {
    let err: any = null;

    try {
      const result = await this.publishingHousesService.create(request);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        err = e.message;
        throw new BadRequestException({ result: null, message: e.message });
      }

      err = JSON.stringify(e);
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'обновить профиль издательского дома' })
  @Patch(':id')
  @UsePipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  async update(
    @Param('id') id: string,
    @Body()
    request: UpdatePublishingHousesRequestDto,
  ): Promise<ResponseDto<number>> {
    let err: any = null;

    try {
      const result = await this.publishingHousesService.update(
        parseInt(id, 10),
        request,
      );
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        err = e.message;
        throw new BadRequestException({ result: null, message: e.message });
      }

      err = JSON.stringify(e);
      throw httpExeptHandler(e);
    }
  }
}
