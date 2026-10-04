import { getErrorMessage, httpExeptHandler } from '@/helpers';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PageList, ResponseDto } from 'dto/response.dto';
import type { IUserLocals } from 'libs/interfaces';
import { CheckAbilities, UserLocals } from '@/decorators';
import { Actions, Subjects } from '@/common/constants/abilities.constants';
import { AbilitiesGuard } from '@/guards/abilities.guard';
import { QueryParamsRequestDto } from 'dto/request.dto';
import { ProfilePostsService } from './profile_posts.service';
import {
  CreatePostCommentRequestDto,
  CreatePostRepostRequestDto,
  SavePostRequestDto,
} from './dto/posts.request.dto';
import { PostCommentView, PostView } from '@/posts/posts.presenter';

@ApiTags('Посты авторов')
@Controller('profile/posts')
@UseGuards(AbilitiesGuard)
export class ProfilePostsController {
  constructor(private readonly profilePostsService: ProfilePostsService) {}

  @ApiOperation({ summary: 'мои посты (автор)' })
  @Get()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  async getOwn(
    @Query() query: QueryParamsRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<PageList<PostView>>> {
    try {
      const result = await this.profilePostsService.getOwnPosts(
        userId,
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

  @ApiOperation({ summary: 'опубликовать пост' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  @CheckAbilities({ action: Actions.Create, subject: Subjects.Posts })
  async create(
    @Body() request: SavePostRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<PostView>> {
    try {
      const result = await this.profilePostsService.create(userId, request);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'изменить свой пост' })
  @Patch(':id')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  @CheckAbilities({ action: Actions.Update, subject: Subjects.Posts })
  async update(
    @Param('id') idStr: string,
    @Body() request: SavePostRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<PostView>> {
    try {
      const id = this.parseId(idStr);
      const result = await this.profilePostsService.update(userId, id, request);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'удалить свой пост' })
  @Delete(':id')
  @CheckAbilities({ action: Actions.Delete, subject: Subjects.Posts })
  async delete(
    @Param('id') idStr: string,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<number>> {
    try {
      const id = this.parseId(idStr);
      const result = await this.profilePostsService.delete(userId, id);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'лайкнуть пост' })
  @Post(':id/like')
  async like(
    @Param('id') idStr: string,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<boolean>> {
    try {
      await this.profilePostsService.like(userId, this.parseId(idStr));
      return { result: true };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'убрать лайк' })
  @Delete(':id/like')
  async unlike(
    @Param('id') idStr: string,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<boolean>> {
    try {
      await this.profilePostsService.unlike(userId, this.parseId(idStr));
      return { result: true };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'репостнуть к себе на стену' })
  @Post(':id/repost')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  async repost(
    @Param('id') idStr: string,
    @Body() request: CreatePostRepostRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<boolean>> {
    try {
      await this.profilePostsService.repost(userId, this.parseId(idStr), request);
      return { result: true };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'убрать репост' })
  @Delete(':id/repost')
  async unrepost(
    @Param('id') idStr: string,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<boolean>> {
    try {
      await this.profilePostsService.unrepost(userId, this.parseId(idStr));
      return { result: true };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'оставить комментарий к посту' })
  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  async addComment(
    @Param('id') idStr: string,
    @Body() request: CreatePostCommentRequestDto,
    @UserLocals() { userId }: IUserLocals,
  ): Promise<ResponseDto<PostCommentView>> {
    try {
      const result = await this.profilePostsService.addComment(
        userId,
        this.parseId(idStr),
        request,
      );
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: getErrorMessage(e) });
      }
      throw httpExeptHandler(e);
    }
  }

  private parseId(idStr: string): number {
    const id = parseInt(idStr, 10);
    if (Number.isNaN(id)) {
      throw new Error('Произошла ошибка при обработке запроса');
    }
    return id;
  }
}
