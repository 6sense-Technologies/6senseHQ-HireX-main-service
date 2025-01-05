import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  SignupDto,
  LoginDto,
  SocialLoginDto,
  EmailAndRefreshTokenDto,
  EmailDTO,
} from './dto/auth.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from './guards/accessToken.guard';
// import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @Post('refresh')
  refreshTokens(@Body() dto: EmailDTO, @Req() req: Request) {
    const refreshToken: string = req['user'].refreshToken;

    const refreshTokendto: EmailAndRefreshTokenDto = {
      email: dto.email,
      refreshToken: refreshToken,
    };
    return this.authService.refreshTokens(refreshTokendto);
  }
  @Post('social-login')
  socialLogin(@Body() dto: SocialLoginDto) {
    return this.authService.socialLogin(dto);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get('check-login')
  checkLogin() {
    return 'Logged In';
  }
}
