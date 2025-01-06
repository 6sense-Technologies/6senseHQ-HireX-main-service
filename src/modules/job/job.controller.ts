import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
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
  async list(@UserInfo() userInfodto: UserInfoDto) {
    return this.jobService.listJobs(userInfodto);
  }
}
