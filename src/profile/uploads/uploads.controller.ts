import { getErrorMessage, httpExeptHandler } from '@/helpers';
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'dto/response.dto';
import type { IUserLocals } from 'libs/interfaces';
import { UserLocals } from '@/decorators';
import { PresignedUpload, UploadsService } from './uploads.service';
import { PresignUploadRequestDto } from './dto/uploads.request.dto';

@ApiTags('Загрузка файлов (s3)')
@Controller('profile/uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @ApiOperation({
    summary:
      'получить presigned-ссылку для загрузки файла в s3 (personalId/<category>/...)',
  })
  @Post('presign')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async presign(
    @Body() request: PresignUploadRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<PresignedUpload>> {
    try {
      const result = await this.uploadsService.createPresignedUpload(
        userId,
        request.category,
        request.extension,
      );
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({
          result: null,
          message: getErrorMessage(e),
        });
      }
      throw httpExeptHandler(e);
    }
  }
}
