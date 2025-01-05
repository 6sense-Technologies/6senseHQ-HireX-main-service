import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JobService } from './job.service';
import { PrismaService } from '../../prisma.service';

describe('JobService', () => {
  let service: JobService;
  // let prisma: PrismaService;

  const mockPrismaService = {
    job: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    jobPosition: {
      findFirst: jest.fn(),
    },
    jobDepartment: {
      findFirst: jest.fn(),
    },
    jobInterviewStage: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    interviewStage: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<JobService>(JobService);
    // prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createJob', () => {
    it('should throw an error if vacancy is less than 1', async () => {
      const userInfoDTO = { userId: '1', email: 'a@gmail.com' };
      const createJobDto = {
        vacancy: '0',
        interviewStages: [],
        jobPositionName: '',
        jobDepartmentName: '',
      };

      await expect(
        service.createJob(userInfoDTO, createJobDto as any),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.job.create).not.toHaveBeenCalled();
    });

    it('should throw an error if any interview stage is invalid', async () => {
      const userInfoDTO = { userId: '1', email: 'a@gmail.com' };
      const createJobDto = {
        vacancy: '2',
        interviewStages: [{ interviewStageName: 'Invalid Stage' }],
        jobPositionName: 'Developer',
        jobDepartmentName: 'Engineering',
      };

      mockPrismaService.interviewStage.findFirst.mockResolvedValue(null);

      await expect(
        service.createJob(userInfoDTO, createJobDto as any),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.interviewStage.findFirst).toHaveBeenCalledWith({
        where: { interviewStageName: 'Invalid Stage' },
      });
    });
    it('should create a job successfully', async () => {
      const userInfoDTO = { userId: '1', email: 'user@example.com' }; // Include string userId and email
      const createJobDto = {
        jobResponsibility: 'Develop software',
        jobKeywords: 'Software, Developer',
        vacancy: '2',
        jobPositionName: 'Developer',
        jobDepartmentName: 'Engineering',
        interviewStages: [{ interviewStageName: 'HR Interview' }],
      };

      // Mock Prisma calls
      mockPrismaService.interviewStage.findFirst.mockResolvedValue({
        interviewStageId: 1,
        interviewStageName: 'HR Interview',
      });
      mockPrismaService.jobPosition.findFirst.mockResolvedValue({
        jobPositionId: 1,
        jobPositionName: 'Developer',
      });
      mockPrismaService.jobDepartment.findFirst.mockResolvedValue({
        jobDepartmentId: 1,
        jobDepartmentName: 'Engineering',
      });
      mockPrismaService.job.create.mockResolvedValue({
        jobId: '101',
        jobResponsibility: 'Develop software',
        jobKeywords: 'Software, Developer',
        vacancy: 2,
        createdBy: '1',
        jobPositionId: 1,
        jobDepartmentId: 1,
      });
      mockPrismaService.jobInterviewStage.create.mockResolvedValue({
        interviewStageId: 1,
        interviewType: 'HR Interview',
        interviewFormat: 'structured',
        jobId: '101',
        createdBy: '1',
      });

      // Call the service method
      const result = await service.createJob(userInfoDTO, createJobDto as any);

      // Expectations
      expect(mockPrismaService.job.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          jobResponsibility: 'Develop software',
          jobKeywords: 'Software, Developer',
          vacancy: 2,
          createdBy: '1', // Ensure this is a string
          jobPositionId: 1,
          jobDepartmentId: 1,
        }),
      });

      expect(result).toEqual(
        expect.objectContaining({
          jobResponsibility: 'Develop software',
          stages: [
            expect.objectContaining({
              interviewType: 'HR Interview',
            }),
          ],
        }),
      );
    });
  });

  describe('listJobs', () => {
    it('should list all jobs with details', async () => {
      mockPrismaService.job.findMany.mockResolvedValue([
        {
          jobId: 1,
          jobResponsibility: 'Develop software',
          jobKeywords: 'Software',
          vacancy: 2,
          createdBy: 1,
          jobPositionId: 1,
          jobDepartmentId: 1,
        },
      ]);
      mockPrismaService.jobDepartment.findFirst.mockResolvedValue({
        jobDepartmentId: 1,
        jobDepartmentName: 'Engineering',
      });
      mockPrismaService.jobPosition.findFirst.mockResolvedValue({
        jobPositionId: 1,
        jobPositionName: 'Developer',
      });
      mockPrismaService.jobInterviewStage.findMany.mockResolvedValue([
        {
          interviewStageId: 1,
          interviewType: 'HR Interview',
          interviewFormat: 'structured',
        },
      ]);

      const result = await service.listJobs();

      expect(mockPrismaService.job.findMany).toHaveBeenCalled();
      expect(result).toEqual([
        expect.objectContaining({
          jobResponsibility: 'Develop software',
          jobPositionName: 'Developer',
          jobDepartmentName: 'Engineering',
          interviewStages: [
            expect.objectContaining({
              interviewType: 'HR Interview',
            }),
          ],
        }),
      ]);
    });
  });
});
