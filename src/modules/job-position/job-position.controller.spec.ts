import { Test, TestingModule } from '@nestjs/testing';
import { JobPositionController } from './job-position.controller';

describe('JobPositionController', () => {
  let controller: JobPositionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobPositionController],
    }).compile();

    controller = module.get<JobPositionController>(JobPositionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
