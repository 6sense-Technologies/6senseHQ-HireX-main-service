import { Controller, Post, Body, Get, UseGuards, Query } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDtoUsingName } from './dto/job.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserInfoDto } from '../user/dto/user.dto';
import { UserInfo } from '../user/decorators/user.decorator';

@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post('create')
  async create(
    @UserInfo() userInfoDTO: UserInfoDto,
    @Body() createJobDto: CreateJobDtoUsingName,
  ) {
    return this.jobService.createJob(userInfoDTO, createJobDto);
  }

  @Get('list')
  async list(
    @UserInfo() userInfoDto: UserInfoDto,
    @Query('offset') offsetString: string = '0',
    @Query('limit') limitString: string = '5',
  ) {
    return this.jobService.listJobs(userInfoDto, offsetString, limitString);
  }

  @Get('detail')
  async detail(
    @UserInfo() userInfoDto: UserInfoDto,
    @Query('id') jobId: string,
  ) {
    return this.jobService.viewJob(userInfoDto, jobId);
  }
}
