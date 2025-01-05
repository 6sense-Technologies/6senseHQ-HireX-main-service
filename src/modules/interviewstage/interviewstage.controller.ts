import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { InterviewstageService } from './interviewstage.service';
// import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { OnlyInterviewStage } from './dto/interviewstage.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
@Controller('interviewstage')
export class InterviewstageController {
  constructor(private readonly interviewStage: InterviewstageService) {}

  @Post('create')
  async createInterview(
    @Req() req,
    @Body() interviewStagedto: OnlyInterviewStage,
  ) {
    return this.interviewStage.create(
      { userId: req.user.userId, email: req.user.email },
      interviewStagedto,
    );
  }

  @Get('list')
  async getInterviewStageList(@Req() req) {
    return this.interviewStage.list({
      userId: req.user.userId,
      email: req.user.email,
    });
  }
}
