import { Controller, Post, Body, Get } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/job.dto';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  async create(@Body() createJobDto: CreateJobDto) {
    return this.jobService.createJob(createJobDto);
  }

  @Get()
  async list() {
    return this.jobService.listJobs();
  }
}
