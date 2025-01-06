import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { InterviewstageService } from './interviewstage.service';
// import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { OnlyInterviewStage } from './dto/interviewstage.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { UserInfoDto } from '../user/dto/user.dto';
import { UserInfo } from '../user/decorators/user.decorator';
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
@Controller('interviewstage')
export class InterviewstageController {
  constructor(private readonly interviewStage: InterviewstageService) {}

  @Post('create')
  async createInterview(
    @UserInfo() userInfoDto: UserInfoDto,
    @Body() interviewStagedto: OnlyInterviewStage,
  ) {
    return this.interviewStage.create(userInfoDto, interviewStagedto);
  }

  @Get('list')
  async getInterviewStageList(@UserInfo() userInfoDto: UserInfoDto) {
    return this.interviewStage.list(userInfoDto);
  }
}
