import { Test, TestingModule } from '@nestjs/testing';
import { JobDepartmentService } from './job-department.service';

describe('JobDepartmentService', () => {
  let service: JobDepartmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobDepartmentService],
    }).compile();

    service = module.get<JobDepartmentService>(JobDepartmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
