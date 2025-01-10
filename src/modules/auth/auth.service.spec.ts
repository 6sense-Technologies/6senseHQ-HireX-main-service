import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { EmailService } from '../email-service/email.service';
import { mockConfig } from '../../mocks/mockConfig';

// Mocks for PrismaService and JwtService
const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  role: {
    findFirst: jest.fn(),
  },
};
const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};
const mockEmailService = {
  sendVerficationEmail: jest.fn(),
};
jest.mock('../../../src/configuration/app.config', () => ({
  appConfig: {
    APP_PORT: 3000,
    DATABASE_URL: 'srv://user:password@localhost:5432/db',
    SENTRY_DSN: 'mock-sentry-dsn',
    JWT_SECRET: 'mock-jwt-secret',
    JWT_REFRESH_SECRET: 'mock-jwt-refresh-secret',
    JWT_EXPIRE: '1h',
    JWT_EXPIRE_REFRESH_TOKEN: '7d',
    SALT_ROUND: '10',
    GOOGLE_CLIENT_ID: 'mock-google-client-id',
    GOOGLE_CLIENT_SECRET: 'mock-google-client-secret',
    EMAIL_HOST: 'smtp.mailtrap.io',
    EMAIL_USERNAME: 'mock-email-username',
    EMAIL_PASSWORD: 'mock-email-password',
    EMAIL_SERVICE_PORT: 2525,
    EMAIL_VERIFICATION_SECRET: 'mock-email-verification-secret',
    EMAIL_VERIFICATION_SUCCESS_REDIRECT: 'http://localhost:3000/success',
    EMAIL_VERIFICATION_FAILED_REDIRECT: 'http://localhost:3000/fail',
    EMAIL_VERIFY_URL: 'http://localhost:3000/verify',
    EMAIL_SENDER: 'noreply@example.com',
  },
}));
jest.mock('google-auth-library');

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Testing signup method
  describe('signup', () => {
    it('should successfully sign up a user', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        roleNames: ['Admin'],
      };

      jest.spyOn(service, 'checkUser').mockResolvedValue(false);
      jest.spyOn(service, 'findRoleIdsByName').mockResolvedValue(['1']);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      mockPrisma.user.create.mockResolvedValue({
        id: '123',
        name: dto.name,
        email: dto.email,
        is_verified: false,
        is_deleted: false,
      });
      mockJwtService.sign.mockImplementation(
        (payload) => `token-${payload.userId}`,
      );

      const result = await service.signup(dto);

      expect(service.checkUser).toHaveBeenCalledWith(dto.email);
      expect(service.findRoleIdsByName).toHaveBeenCalledWith(dto.roleNames);
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: dto.name,
            email: dto.email,
            password: 'hashedPassword',
            roleIds: ['1'],
          }),
        }),
      );
      expect(result.tokens.access_token).toEqual('token-123');
      expect(result.userInfo).toEqual(
        expect.objectContaining({
          id: '123',
          name: dto.name,
          email: dto.email,
          roleNames: dto.roleNames,
        }),
      );
    });

    it('should throw ConflictException if user already exists', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        roleNames: ['Admin'],
      };

      jest.spyOn(service, 'checkUser').mockResolvedValue(true);

      await expect(service.signup(dto)).rejects.toThrow(ConflictException);
    });
  });

  // Testing login method
  describe('login', () => {
    it('should successfully log in a user', async () => {
      const dto = { email: 'john.doe@example.com', password: 'password123' };
      const user = { id: '123', email: dto.email, password: 'hashedPassword' };

      mockPrisma.user.findUnique.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      mockJwtService.sign.mockImplementation(
        (payload) => `token-${payload.userId}`,
      );

      const result = await service.login(dto);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        dto.password,
        'hashedPassword',
      );
      expect(result.tokens.access_token).toEqual('token-123');
      expect(result.userInfo).toEqual(
        expect.objectContaining({ email: dto.email }),
      );
    });

    it('should throw NotFoundException if invalid credentials are provided', async () => {
      const dto = { email: 'john.doe@example.com', password: 'password123' };
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(NotFoundException);
    });
  });

  // Testing refreshTokens method
  describe('refreshTokens', () => {
    it('should successfully refresh tokens', async () => {
      const dto = {
        email: 'john.doe@example.com',
        refreshToken: 'refreshToken',
      };
      const user = {
        id: '123',
        email: dto.email,
        refresh_token: 'hashedRefreshToken',
      };

      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockJwtService.verify.mockResolvedValue(true);
      mockJwtService.sign.mockImplementation(
        (payload) => `token-${payload.userId}`,
      );

      const result = await service.refreshTokens(dto);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(mockJwtService.verify).toHaveBeenCalledWith(dto.refreshToken, {
        secret: mockConfig.JWT_REFRESH_SECRET,
      });
      expect(result.access_token).toEqual('token-123');
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const dto = {
        email: 'john.doe@example.com',
        refreshToken: 'invalidToken',
      };
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // Testing socialLogin method (Google)
  describe('socialLogin', () => {
    it('should successfully log in with Google', async () => {
      const dto = { provider: 'google', idToken: 'idToken' };
      const mockPayload = {
        email: 'john.doe@example.com',
        name: 'John Doe',
        sub: 'google-sub-id',
      };

      (OAuth2Client.prototype.verifyIdToken as jest.Mock).mockResolvedValue({
        getPayload: jest.fn().mockReturnValue(mockPayload),
      });

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: '123',
        email: mockPayload.email,
        name: mockPayload.name,
      });
      mockJwtService.sign.mockImplementation(
        (payload) => `token-${payload.userId}`,
      );

      const result = await service.socialLogin(dto);

      expect(OAuth2Client.prototype.verifyIdToken).toHaveBeenCalled();
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockPayload.email },
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: mockPayload.email,
            name: mockPayload.name,
          }),
        }),
      );
      expect(result.tokens.access_token).toEqual('token-123');
      expect(result.userInfo).toEqual(
        expect.objectContaining({ email: mockPayload.email }),
      );
    });

    it('should throw BadRequestException for unsupported providers', async () => {
      const dto = { provider: 'facebook', idToken: 'idToken' };

      await expect(service.socialLogin(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
