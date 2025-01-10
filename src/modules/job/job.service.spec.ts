import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JobService } from './job.service';
import { PrismaService } from '../../prisma.service';

describe('JobService', () => {
  let service: JobService;

  const mockPrismaService = {
    job: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    jobPosition: {
      findFirst: jest.fn(),
    },
    jobDepartment: {
      findFirst: jest.fn(),
    },
    jobInterviewStage: {
      createMany: jest.fn(),
      findMany: jest.fn(),
    },
    interviewStage: {
      findMany: jest.fn(),
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

      mockPrismaService.interviewStage.findMany.mockResolvedValue([]);

      await expect(
        service.createJob(userInfoDTO, createJobDto as any),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.interviewStage.findMany).toHaveBeenCalledWith({
        where: {
          interviewStageName: {
            in: ['Invalid Stage'],
          },
        },
      });
    });

    it('should create a job successfully', async () => {
      const userInfoDTO = { userId: '1', email: 'user@example.com' };
      const createJobDto = {
        jobResponsibility: 'Develop software',
        jobKeywords: 'Software, Developer',
        vacancy: 2,
        jobPositionName: 'Developer',
        jobDepartmentName: 'Engineering',
        interviewStages: [
          { interviewStageName: 'HR Interview', interviewMedium: 'Online' },
        ],
      };

      mockPrismaService.interviewStage.findMany.mockResolvedValue([
        {
          interviewStageId: 1,
          interviewStageName: 'HR Interview',
        },
      ]);
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

      const result = await service.createJob(userInfoDTO, createJobDto as any);

      expect(mockPrismaService.job.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          jobResponsibility: 'Develop software',
          jobKeywords: 'Software, Developer',
          vacancy: 2,
          createdBy: '1',
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
              interviewMedium: 'Online',
            }),
          ],
        }),
      );
    });
  });

  describe('listJobs', () => {
    it('should list all jobs with details', async () => {
      const userInfoDTO = { userId: '1', email: 'a@gmail.com' };
      mockPrismaService.job.findMany.mockResolvedValue([
        {
          jobId: 1,
          jobPosition: { jobPositionName: 'Developer' },
          jobDepartment: { jobDepartmentName: 'Engineering' },
          vacancy: 2,
          createdAt: new Date('2023-01-01T00:00:00Z'),
          createdByUser: { name: 'John Doe', email: 'john@example.com' },
        },
      ]);
      mockPrismaService.job.count.mockResolvedValue(1);

      const result = await service.listJobs(userInfoDTO, '1', '10');

      expect(mockPrismaService.job.findMany).toHaveBeenCalledWith({
        where: {
          createdBy: userInfoDTO.userId,
        },
        select: {
          jobId: true,
          jobPosition: {
            select: {
              jobPositionName: true,
            },
          },
          jobDepartment: {
            select: {
              jobDepartmentName: true,
            },
          },
          vacancy: true,
          createdAt: true,
          createdByUser: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: 0,
        take: 10,
      });

      expect(result).toEqual({
        jobs: [
          {
            jobId: 1,
            jobPosition: 'Developer',
            numberOfVacancies: 2,
            createdBy: 'John Doe',
            createdAt: '01/01/2023',
          },
        ],
        meta: {
          totalCount: 1,
          currentPage: 1,
          totalPages: 1,
        },
      });
    });
  });
});
