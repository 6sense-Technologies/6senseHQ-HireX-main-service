import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

jest.mock('google-auth-library');

describe('AuthService', () => {
  let service: AuthService;
  // let prisma: PrismaService;
  // let jwtService: JwtService;
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    // prisma = module.get<PrismaService>(PrismaService);
    // jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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

  describe('login', () => {
    it('should successfully log in a user', async () => {
      const dto = { email: 'john.doe@example.com', password: 'password123' };
      const user = {
        id: '123',
        email: dto.email,
        password: 'hashedPassword',
      };

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
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      mockJwtService.sign.mockImplementation(
        (payload) => `token-${payload.userId}`,
      );

      const result = await service.refreshTokens(dto);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        dto.refreshToken,
        user.refresh_token,
      );
      expect(result.access_token).toEqual('token-123');
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const dto = {
        email: 'john.doe@example.com',
        refreshToken: 'refreshToken',
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

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
