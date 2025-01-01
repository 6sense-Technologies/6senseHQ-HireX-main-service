import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcrypt';
import {
  SignupDto,
  LoginDto,
  SocialLoginDto,
  EmailAndRefreshTokenDto,
} from './dto/auth.dto';
import { OAuth2Client } from 'google-auth-library';
import { appConfig } from 'src/configuration/app.config';
import axios from 'axios';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const hashedPassword = await bcrypt.hash(
      dto.password,
      parseInt(appConfig.SALT_ROUND),
    );
    const alreadyExists = await this.checkUser(dto.email);
    if (alreadyExists) {
      throw new ConflictException('User already exists');
    }
    const roleIds = await this.findRoleIdsByName(dto.roleNames);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        roleIds: roleIds,
        is_verified: false,
        is_deleted: false,
      },
    });
    const tokens = this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    delete user.password;
    delete user.access_token;
    delete user.refresh_token;
    delete user.is_deleted;
    delete user.roleIds;
    delete user.provider;
    delete user.providerId;
    user['roleNames'] = dto.roleNames;
    return { tokens, userInfo: user };
  }
  async checkUser(email: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (user) {
      return true;
    } else {
      return false;
    }
  }
  async findRoleIdsByName(roleNames: string[]): Promise<string[]> {
    const roleIds = [];
    for (let i = 0; i < roleNames.length; i += 1) {
      const role = await this.prisma.role.findFirst({
        where: {
          roleName: roleNames[i],
        },
      });
      if (!role) {
        throw new BadRequestException('Invalid Role Name');
      } else {
        roleIds.push(role.id);
      }
    }
    return roleIds;
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new NotFoundException('Invalid credentials');
    }
    const tokens = this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    delete user.password;
    delete user.access_token;
    delete user.refresh_token;
    delete user.is_deleted;
    delete user.roleIds;
    delete user.provider;
    delete user.providerId;
    return { tokens, userInfo: user };
  }

  private generateTokens(userId: string, email: string) {
    const access_token = this.jwtService.sign(
      { userId, email },
      { secret: appConfig.JWT_SECRET, expiresIn: appConfig.JWT_EXPIRE },
    );
    const refresh_token = this.jwtService.sign(
      { userId, email },
      {
        secret: appConfig.JWT_REFRESH_SECRET,
        expiresIn: appConfig.JWT_EXPIRE_REFRESH_TOKEN,
      },
    );
    return { access_token, refresh_token };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(
      refreshToken,
      parseInt(appConfig.SALT_ROUND),
    );
    await this.prisma.user.update({
      where: { id: userId },
      data: { refresh_token: hashedRefreshToken },
    });
  }

  async refreshTokens(dto: EmailAndRefreshTokenDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (
      !user ||
      !(await bcrypt.compare(dto.refreshToken, user.refresh_token))
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const tokens = this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  async socialLogin(dto: SocialLoginDto) {
    console.warn(dto);
    if (dto.provider !== 'google') {
      throw new BadRequestException('Unsupported provider');
    }
    console.log(appConfig.GOOGLE_CLIENT_ID)
    console.log(appConfig.GOOGLE_CLIENT_SECRET)
    const client = new OAuth2Client(
      appConfig.GOOGLE_CLIENT_ID,
      appConfig.GOOGLE_CLIENT_SECRET,
      'postmessage'
    );
    
    const response = await client.getToken(dto.authCode);
    
    const idToken = response.tokens.id_token;
 
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: appConfig.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    const { email, name, sub } = payload;

    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: name,
          email: email,
          provider: 'google',
          providerId: sub,
          is_verified: true,
          roleIds: [],
        },
      });
    }

    const tokens = this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    delete user.password;
    delete user.access_token;
    delete user.refresh_token;
    delete user.is_deleted;
    delete user.roleIds;
    delete user.provider;
    delete user.providerId;
    return {tokens,userInfo:user};
  }
}
