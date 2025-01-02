import { Controller, Get } from '@nestjs/common';
import { JobPositionService } from './job-position.service';

@Controller('job-position')
export class JobPositionController {
  constructor(private readonly jobPositionService: JobPositionService) {}
  @Get('list')
  async list() {
    return this.jobPositionService.listJobPosition();
  }
}
