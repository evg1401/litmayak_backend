import { getErrorMessage, httpExeptHandler } from '@/helpers';
import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Param,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PageList, ResponseDto } from 'dto/response.dto';
import { QueryParamsRequestDto } from 'dto/request.dto';
import { PostsService } from './posts.service';
import { PostCommentView, PostView } from './posts.presenter';
import { validateJwt } from 'configs/jwt.config';
import type { AuthOpts } from 'configs/jwt.config';
import { JwtTypes } from 'configs/jwt.config';
import type { Request } from 'express';

@ApiTags('Посты авторов')
@Controller('authors/:nickname/posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    @Inject('AUTH_CONFIG') private authConfig: AuthOpts,
  ) {}

  @ApiOperation({ summary: 'лента постов автора' })
  @Get()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  async getList(
    @Param('nickname') nickname: string,
    @Query() query: QueryParamsRequestDto,
    @Req() req: Request,
  ): Promise<ResponseDto<PageList<PostView>>> {
    try {
      const result = await this.postsService.getAuthorPosts(
        nickname,
        query.page,
        query.limit,
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

  @ApiOperation({ summary: 'комментарии к посту' })
  @Get(':postId/comments')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  async getComments(
    @Param('nickname') nickname: string,
    @Param('postId') postIdStr: string,
    @Query() query: QueryParamsRequestDto,
  ): Promise<ResponseDto<PageList<PostCommentView>>> {
    try {
      const postId = parseInt(postIdStr, 10);
      if (Number.isNaN(postId)) {
        throw new Error('Произошла ошибка при обработке запроса');
      }

      const result = await this.postsService.getPostComments(
        nickname,
        postId,
        query.page,
        query.limit,
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
