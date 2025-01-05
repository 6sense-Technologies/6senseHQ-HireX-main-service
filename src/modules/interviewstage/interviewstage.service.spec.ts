import { Test, TestingModule } from '@nestjs/testing';
import { InterviewstageService } from './interviewstage.service';
import { PrismaService } from '../../prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('InterviewstageService', () => {
  let service: InterviewstageService;
  let prisma: PrismaService;

  const mockPrismaService = {
    interviewStage: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewstageService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InterviewstageService>(InterviewstageService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw a BadRequestException if the interview stage name already exists', async () => {
      const userdto = { userId: '1', email: 'a@gmail.com' };
      const interviewStagedto = { interviewStageName: 'Existing Stage' };

      mockPrismaService.interviewStage.findFirst.mockResolvedValueOnce({
        interviewStageName: 'Existing Stage',
      });

      await expect(service.create(userdto, interviewStagedto)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.interviewStage.findFirst).toHaveBeenCalledWith({
        where: {
          interviewStageName: interviewStagedto.interviewStageName,
        },
      });
    });

    it('should create a new interview stage if the name does not exist', async () => {
      const userdto = { userId: '1', email: 'a@gmail.com' };
      const interviewStagedto = { interviewStageName: 'New Stage' };

      mockPrismaService.interviewStage.findFirst.mockResolvedValueOnce(null);
      mockPrismaService.interviewStage.create.mockResolvedValueOnce({
        interviewStageName: 'New Stage',
        createdBy: userdto.userId,
      });

      const result = await service.create(userdto, interviewStagedto);

      expect(prisma.interviewStage.findFirst).toHaveBeenCalledWith({
        where: {
          interviewStageName: interviewStagedto.interviewStageName,
        },
      });
      expect(prisma.interviewStage.create).toHaveBeenCalledWith({
        data: {
          interviewStageName: interviewStagedto.interviewStageName,
          createdBy: userdto.userId,
        },
      });
      expect(result).toEqual({
        interviewStageName: 'New Stage',
        createdBy: userdto.userId,
      });
    });
  });

  describe('list', () => {
    it('should return a list of interview stages based on the user and default stages', async () => {
      const userdto = { userId: '1', email: 'a@gmail.com' };
      const mockInterviewStages = [
        { interviewStageName: 'Phone Interview', createdBy: null },
        { interviewStageName: 'HR Interview', createdBy: null },
        { interviewStageName: 'Custom Stage', createdBy: 1 },
      ];

      mockPrismaService.interviewStage.findMany.mockResolvedValueOnce(
        mockInterviewStages,
      );

      const result = await service.list(userdto);

      expect(prisma.interviewStage.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { createdBy: userdto.userId },
            {
              interviewStageName: {
                in: ['Phone Interview', 'HR Interview'],
              },
            },
          ],
        },
      });
      expect(result).toEqual(mockInterviewStages);
    });
  });
});
