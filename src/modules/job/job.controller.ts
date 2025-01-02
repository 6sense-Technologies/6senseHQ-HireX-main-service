import { Controller, Post, Body, Get } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDtoUsingName } from './dto/job.dto';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post('create')
  async create(@Body() createJobDto: CreateJobDtoUsingName) {
    return this.jobService.createJob(createJobDto);
  }

  @Get('list')
  async list() {
    return this.jobService.listJobs();
  }
}
