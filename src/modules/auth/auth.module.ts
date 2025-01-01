import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PrismaService } from '../../prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { AuthService } from './auth.service';
// import { appConfig } from 'src/configuration/app.config';
import { JWTRefreshTokenStrategy } from './strategy/jwt-refresh.strategy';

@Module({
  imports: [
    PassportModule,
    // JwtModule.register({
    //   secret: appConfig.JWT_SECRET,
    //   signOptions: { expiresIn: appConfig.JWT_EXPIRE },
    // }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, JWTRefreshTokenStrategy],
})
export class AuthModule {}
