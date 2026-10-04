import { ResponseDto } from 'dto/response.dto';

type TokenResponse = {
  access: string;
};

export class AuthGenerateCodeDto extends ResponseDto<boolean> {}

export class AuthSignInDto extends ResponseDto<TokenResponse> {}

export class AuthRefreshTokenDto extends ResponseDto<TokenResponse> {}

export class AuthLogoutDto extends ResponseDto<boolean> {}

type EmailCheckResponse = {
  available: boolean;
};

export class AuthEmailCheckDto extends ResponseDto<EmailCheckResponse> {}

type NicknameSuggestResponse = {
  nickname: string;
};

export class AuthNicknameSuggestDto extends ResponseDto<NicknameSuggestResponse> {}
