import { Test, TestingModule } from '@nestjs/testing';
import { InterviewstageService } from './interviewstage.service';

describe('InterviewstageService', () => {
  let service: InterviewstageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InterviewstageService],
    }).compile();

    service = module.get<InterviewstageService>(InterviewstageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
