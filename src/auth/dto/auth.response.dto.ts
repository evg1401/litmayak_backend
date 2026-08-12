import { ResponseDto } from 'dto/response.dto';

type TokenResponse = {
  access: string;
};

export class AuthGenerateCodeDto extends ResponseDto<number> {}

export class AuthSignInDto extends ResponseDto<TokenResponse> {}

export class AuthRefreshTokenDto extends ResponseDto<TokenResponse> {}

export class AuthLogoutDto extends ResponseDto<boolean> {}
