import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { OnlyInterviewStage } from './dto/interviewstage.dto';
import { UserInfoDto } from '../job/dto/job.dto';
@UseGuards()
@Injectable()
export class InterviewstageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userdto: UserInfoDto, interviewStagedto: OnlyInterviewStage) {
    const interviewStage = await this.prisma.interviewStage.findFirst({
      where: {
        interviewStageName: interviewStagedto.interviewStageName,
      },
    });
    if (interviewStage) {
      throw new BadRequestException('Interview Stage name already exists');
    }
    return await this.prisma.interviewStage.create({
      data: {
        interviewStageName: interviewStagedto.interviewStageName,
        createdBy: userdto.userId,
      },
    });
  }
  async list(userdto: UserInfoDto) {
    const interviewStages = await this.prisma.interviewStage.findMany({
      where: {
        OR: [
          { createdBy: userdto.userId },
          {
            interviewStageName: {
              in: ['Phone Interview', 'HR Interview'],
            },
          },
        ],
      },
    });
    return interviewStages;
  }
}
