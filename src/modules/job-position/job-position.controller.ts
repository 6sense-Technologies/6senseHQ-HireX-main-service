import { Controller, Get, Query } from '@nestjs/common';
import { JobPositionService } from './job-position.service';

@Controller('job-position')
export class JobPositionController {
  constructor(private readonly jobPositionService: JobPositionService) {}
  @Get('list')
  async list(@Query('department') query: string) {
    const departmentName = query || 'all';
    return this.jobPositionService.listJobPosition(departmentName);
  }
}
