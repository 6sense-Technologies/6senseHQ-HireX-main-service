import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../src/prisma.service';
import { Response } from 'express';
import { UserInfoDto } from '../user/dto/user.dto';
import { mockConfig } from '../../mocks/mockConfig';
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

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: MailerService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
    // appConfigService = module.get<Interface<appConfig>>(appConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendVerificationEmail', () => {
    const mockUserInfo: UserInfoDto = {
      email: 'test@example.com',
      userId: '1',
    };

    const mockToken = 'mock-verification-token';
    const mockEmailResult = { messageId: 'mock-message-id' };

    beforeEach(() => {
      mockJwtService.sign.mockReturnValue(mockToken);
      mockMailerService.sendMail.mockResolvedValue(mockEmailResult);
    });

    it('should send verification email successfully', async () => {
      const result = await service.sendVerficationEmail(mockUserInfo);

      expect(jwtService.sign).toHaveBeenCalledWith(mockUserInfo, {
        secret: mockConfig.EMAIL_VERIFICATION_SECRET,
      });

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        from: `6sense Projects ${mockConfig.EMAIL_SENDER}`,
        to: mockUserInfo.email,
        subject: `Please Verify your account for ${mockUserInfo.email}-HireX`,
        text: expect.stringContaining(mockToken),
      });

      expect(result).toEqual({
        result: mockEmailResult,
        emailBody: expect.stringContaining(mockToken),
      });
    });

    it('should throw error if email sending fails', async () => {
      const error = new Error('Email sending failed');
      mockMailerService.sendMail.mockRejectedValue(error);

      await expect(service.sendVerficationEmail(mockUserInfo)).rejects.toThrow(
        error,
      );
    });
  });

  describe('verifyUser', () => {
    const mockToken = 'mock-token';
    const mockDecodedInfo = { email: 'test@example.com' };
    const mockResponse = {
      redirect: jest.fn(),
    } as unknown as Response;

    it('should verify user successfully', async () => {
      mockJwtService.verify.mockReturnValue(true);
      mockJwtService.decode.mockReturnValue(mockDecodedInfo);
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 1,
        email: mockDecodedInfo.email,
      });
      mockPrismaService.user.update.mockResolvedValue({
        id: 1,
        email: mockDecodedInfo.email,
        is_verified: true,
      });

      await service.verifyUser(mockToken, mockResponse);

      expect(jwtService.verify).toHaveBeenCalledWith(mockToken, {
        secret: mockConfig.EMAIL_VERIFICATION_SECRET,
      });
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: mockDecodedInfo.email },
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { email: mockDecodedInfo.email },
        data: { is_verified: true },
      });
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        mockConfig.EMAIL_VERIFICATION_SUCCESS_REDIRECT,
      );
    });

    it('should redirect to failure page if user not found', async () => {
      mockJwtService.verify.mockReturnValue(true);
      mockJwtService.decode.mockReturnValue(mockDecodedInfo);
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await service.verifyUser(mockToken, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        mockConfig.EMAIL_VERIFICATION_FAILED_REDIRECT,
      );
    });

    it('should redirect to failure page if token verification fails', async () => {
      mockJwtService.verify.mockReturnValue(false);

      await service.verifyUser(mockToken, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        mockConfig.EMAIL_VERIFICATION_FAILED_REDIRECT,
      );
    });

    it('should handle verification errors', async () => {
      const error = new Error('Verification failed');
      mockJwtService.verify.mockImplementation(() => {
        throw error;
      });

      await service.verifyUser(mockToken, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        mockConfig.EMAIL_VERIFICATION_FAILED_REDIRECT,
      );
    });
  });
});
