import { Test, TestingModule } from '@nestjs/testing';
import { JobDepartmentController } from './job-department.controller';

describe('JobDepartmentController', () => {
  let controller: JobDepartmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobDepartmentController],
    }).compile();

    controller = module.get<JobDepartmentController>(JobDepartmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
