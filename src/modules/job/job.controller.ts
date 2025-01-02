import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDtoUsingName } from './dto/job.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post('create')
  async create(@Req() req, @Body() createJobDto: CreateJobDtoUsingName) {
    return this.jobService.createJob(
      {
        userId: req.user.userId,
        email: req.user.email,
      },
      createJobDto,
    );
  }

  @Get('list')
  async list() {
    return this.jobService.listJobs();
  }
}
