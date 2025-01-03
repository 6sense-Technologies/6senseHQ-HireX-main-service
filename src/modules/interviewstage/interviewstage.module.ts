import { Module } from '@nestjs/common';
import { InterviewstageController } from './interviewstage.controller';
import { InterviewstageService } from './interviewstage.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [InterviewstageController],
  providers: [InterviewstageService, PrismaService],
})
export class InterviewstageModule {}
