import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { appConfig } from 'src/configuration/app.config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JWTRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private jwtService: JwtService) {
    super({
      usernameField: 'email',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: appConfig.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
    const jwtObject = this.jwtService.verify(refreshToken, {
      secret: appConfig.JWT_REFRESH_SECRET,
    });
    if (jwtObject) {
      return { ...payload, refreshToken };
    } else {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
