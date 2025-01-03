import { Test, TestingModule } from '@nestjs/testing';
import { InterviewstageController } from './interviewstage.controller';

describe('InterviewstageController', () => {
  let controller: InterviewstageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterviewstageController],
    }).compile();

    controller = module.get<InterviewstageController>(InterviewstageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
