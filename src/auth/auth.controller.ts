import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthGenerateCodeDto,
  AuthLogoutDto,
  AuthRefreshTokenDto,
  AuthSignInDto,
} from './dto/auth.response.dto';
import {
  GenerateCodeRequestDto,
  SignInCodeRequestDto,
} from './dto/auth.request.dto';
import { DeviceUid } from '@/decorators';
import { httpExeptHandler, setCookie } from '@/helpers/http.helper';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthOpts } from 'configs/jwt.config';
import { API_GLOBAL_PREFIX } from 'configs/api.config';
import { AuthCodeEventsService } from './auth_code_events.service';
import { AuthLogPending } from './dto/auth_code_events.dto';

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCodeEventsService: AuthCodeEventsService,
    @Inject('AUTH_CONFIG') private authConfig: AuthOpts,
  ) {}

  @ApiOperation({ summary: 'получить код' })
  @Post('code/generate')
  @UsePipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  async generateAuthCode(
    @Body()
    request: GenerateCodeRequestDto,
    @DeviceUid() deviceUid: string,
  ): Promise<AuthGenerateCodeDto> {
    let err: any = null;

    try {
      if (!deviceUid) {
        throw new BadRequestException(
          'Отсутствует идентификатор клиентского приложения',
        );
      }

      const result = await this.authService.generateAuthCode(
        request,
        deviceUid,
      );

      return { result };
    } catch (e) {
      if (e instanceof Error) {
        err = e.message;
        throw new BadRequestException({ result: null, message: e.message });
      }

      err = JSON.stringify(e);
      throw httpExeptHandler(e);
    } finally {
      let status = AuthLogPending.Success;
      if (err) {
        status = AuthLogPending.Failed;
      }

      await this.authCodeEventsService.updateStatusAuthLog(
        request.phone,
        deviceUid,
        status,
        err,
      );
    }
  }

  @ApiOperation({ summary: 'обновить код' })
  @Post('code/refresh')
  @UsePipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  @Post()
  async refreshCode(
    @Body()
    request: GenerateCodeRequestDto,
    @DeviceUid() deviceUid: string,
  ): Promise<AuthGenerateCodeDto> {
    let err: any = null;

    try {
      if (!deviceUid) {
        throw new BadRequestException(
          'Отсутствует идентификатор клиентского приложения',
        );
      }

      await this.authCodeEventsService.AddAuthLog({
        phone: request.phone,
        deviceUid,
        notifyType: request.channel,
        eventType: 'refresh_code',
        status: AuthLogPending.Pending,
      });

      const result = await this.authService.refreshAuthCode(request, deviceUid);
      return { result };
    } catch (e) {
      if (e instanceof Error) {
        err = e.message;
        throw new BadRequestException({ result: null, message: e.message });
      }

      throw httpExeptHandler(e);
    } finally {
      let status = AuthLogPending.Success;
      if (err) {
        status = AuthLogPending.Failed;
      }

      await this.authCodeEventsService.updateStatusAuthLog(
        request.phone,
        deviceUid,
        status,
        err,
      );
    }
  }

  @ApiOperation({ summary: 'авторизация по коду' })
  @Post('code/signin')
  @UsePipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
      skipNullProperties: true,
    }),
  )
  async signInCode(
    @Body()
    request: SignInCodeRequestDto,
    @DeviceUid() deviceUid: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSignInDto> {
    try {
      if (!deviceUid) {
        throw new BadRequestException(
          'Отсутствует идентификатор клиентского приложения',
        );
      }

      const result = await this.authService.signInCode(request, deviceUid);

      this.setRefreshTokenCookie(response, result.refresh);

      return { result: { access: result.access } };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: e.message });
      }

      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'обновить токен' })
  @Get('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @DeviceUid() deviceUid: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthRefreshTokenDto> {
    try {
      if (!deviceUid) {
        throw new BadRequestException(
          'Отсутствует идентификатор клиентского приложения',
        );
      }

      const token = this.getRefreshTokenCookie(req);
      if (!token?.refresh) {
        throw new UnauthorizedException(
          'Доступ запрещен. Требуется авторизация',
        );
      }

      const result = await this.authService.refreshToken(
        token.refresh,
        deviceUid,
      );

      this.clearRefreshTokenCookie(response);
      this.setRefreshTokenCookie(response, result.refresh);

      return { result: { access: result.access } };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: e.message });
      }

      throw httpExeptHandler(e);
    }
  }

  @ApiOperation({ summary: 'выйти' })
  @Get('logout')
  async logout(@DeviceUid() deviceUid: string): Promise<AuthLogoutDto> {
    try {
      if (!deviceUid) {
        throw new BadRequestException(
          'Отсутствует идентификатор клиентского приложения',
        );
      }

      const result = await this.authService.logout(deviceUid);

      return { result };
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException({ result: null, message: e.message });
      }

      throw httpExeptHandler(e);
    }
  }

  private setRefreshTokenCookie(response: Response, token: string) {
    setCookie(
      response,
      'refresh',
      token,
      `/${API_GLOBAL_PREFIX}/auth/refresh-token`,
      this.authConfig.jwt.refreshExpiresIn,
      this.authConfig.cookie.cookieDomain,
    );
  }

  private clearRefreshTokenCookie(response: Response) {
    setCookie(
      response,
      'refresh',
      '',
      `/${API_GLOBAL_PREFIX}/auth/refresh-token`,
      -1,
      this.authConfig.cookie.cookieDomain,
    );
  }

  private getRefreshTokenCookie(request: Request) {
    // @ts-ignore
    return request.cookies;
  }
}
