import { Test, TestingModule } from '@nestjs/testing';
import { JobPositionService } from './job-position.service';
import { PrismaService } from '../../prisma.service';

describe('JobPositionService', () => {
  let service: JobPositionService;
  let prismaService: PrismaService;

  const mockJobPositions = [
    { id: 1, title: 'Software Engineer', description: 'Develop software' },
    { id: 2, title: 'Product Manager', description: 'Manage products' },
  ];

  const mockPrismaService = {
    jobPosition: {
      findMany: jest.fn().mockResolvedValue(mockJobPositions),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobPositionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<JobPositionService>(JobPositionService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listJobPosition', () => {
    it('should return a list of job positions', async () => {
      const result = await service.listJobPosition();

      expect(prismaService.jobPosition.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockJobPositions);
    });

    it('should handle errors from PrismaService', async () => {
      jest
        .spyOn(prismaService.jobPosition, 'findMany')
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(service.listJobPosition()).rejects.toThrow('Database error');
    });
  });
});
