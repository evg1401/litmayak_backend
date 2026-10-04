import { getErrorMessage, httpExeptHandler } from '@/helpers';
import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'dto/response.dto';
import { PostsService } from './posts.service';
import { PostWithAuthorView } from './posts.presenter';
import { LatestPostsQueryDto } from './dto/latest_posts.request.dto';
import { validateJwt } from 'configs/jwt.config';
import type { AuthOpts } from 'configs/jwt.config';
import { JwtTypes } from 'configs/jwt.config';
import type { Request } from 'express';

@ApiTags('Посты авторов')
@Controller('posts')
export class LatestPostsController {
  constructor(
    private readonly postsService: PostsService,
    @Inject('AUTH_CONFIG') private authConfig: AuthOpts,
  ) {}

  @ApiOperation({
    summary: 'последние посты разных авторов - для витрины "Новости от авторов"',
  })
  @Get('latest')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getLatest(
    @Query() query: LatestPostsQueryDto,
    @Req() req: Request,
  ): Promise<ResponseDto<PostWithAuthorView[]>> {
    try {
      const result = await this.postsService.getLatestPosts(
        query.limit ?? 10,
        this.getSoftUserId(req),
      );
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  private getSoftUserId(req: Request): number | undefined {
    const at = req.get('Authorization')?.replace('Bearer', '').trim();
    if (!at) return undefined;

    const payload = validateJwt(
      at,
      this.authConfig.jwt.secret,
      this.authConfig.jwt.iss,
      JwtTypes.Access,
    );

    return typeof payload === 'object' && payload
      ? (payload['userId'] as number | undefined)
      : undefined;
  }
}
