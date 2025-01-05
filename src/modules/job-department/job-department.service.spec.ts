import { Test, TestingModule } from '@nestjs/testing';
import { JobDepartmentService } from './job-department.service';
import { PrismaService } from '../../prisma.service';

describe('JobDepartmentService', () => {
  let service: JobDepartmentService;
  let prismaService: PrismaService;

  const mockJobDepartments = [
    {
      id: 1,
      name: 'Engineering',
      description: 'Handles all technical projects',
    },
    { id: 2, name: 'HR', description: 'Manages human resources' },
  ];

  const mockPrismaService = {
    jobDepartment: {
      findMany: jest.fn().mockResolvedValue(mockJobDepartments),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobDepartmentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<JobDepartmentService>(JobDepartmentService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listJobDepartment', () => {
    it('should return a list of job departments', async () => {
      const result = await service.listJobDepartment();

      expect(prismaService.jobDepartment.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockJobDepartments);
    });

    it('should handle errors from PrismaService', async () => {
      jest
        .spyOn(prismaService.jobDepartment, 'findMany')
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(service.listJobDepartment()).rejects.toThrow(
        'Database error',
      );
    });
  });
});
