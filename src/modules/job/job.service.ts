import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service'; // Assuming PrismaService is in your `prisma` directory
import { CreateJobDtoUsingName } from './dto/job.dto';
import { Job } from '@prisma/client';
import { UserInfoDto } from '../user/dto/user.dto';
@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new job
  async createJob(
    userInfoDTO: UserInfoDto,
    createJobDto: CreateJobDtoUsingName,
  ) {
    const {
      jobResponsibility,
      jobKeywords,
      vacancy,
      jobPositionName,
      jobDepartmentName,
      interviewStages,
    } = createJobDto;

    const vacancyNumber = parseInt(vacancy);
    if (vacancyNumber < 1) {
      throw new BadRequestException('Vacancy can not be 0 or negetive');
    }
    const jobInterviewStagesToAdd = await this.prisma.interviewStage.findMany({
      where: {
        interviewStageName: {
          in: interviewStages.map((interviewStage) => {
            return interviewStage.interviewStageName;
          }),
        },
      },
    });
    if (jobInterviewStagesToAdd.length != interviewStages.length) {
      throw new BadRequestException('One or more interview stages are invalid');
    }
    const jobPosition = await this.prisma.jobPosition.findFirst({
      where: {
        jobPositionName: jobPositionName,
      },
    });
    if (!jobPosition) {
      throw new BadRequestException('Job Position is not valid');
    }
    let job: Job;
    if (
      jobDepartmentName !== undefined &&
      jobDepartmentName !== '' &&
      jobDepartmentName !== null
    ) {
      const jobDepartment = await this.prisma.jobDepartment.findFirst({
        where: {
          jobDepartmentName: jobDepartmentName,
        },
      });
      if (!jobDepartment) {
        throw new BadRequestException('Job department is not valid');
      }

      job = await this.prisma.job.create({
        data: {
          jobResponsibility,
          jobKeywords,
          vacancy: vacancyNumber,
          createdBy: userInfoDTO.userId,
          jobDepartmentId: jobDepartment.jobDepartmentId,
          jobPositionId: jobPosition.jobPositionId,
        },
      });
      job['jobDepartmentName'] = jobDepartment.jobDepartmentName;
    } else {
      job = await this.prisma.job.create({
        data: {
          jobResponsibility,
          jobKeywords,
          vacancy: vacancyNumber,
          createdBy: userInfoDTO.userId,
          jobPositionId: jobPosition.jobPositionId,
        },
      });
    }

    await this.prisma.jobInterviewStage.createMany({
      data: jobInterviewStagesToAdd.map((jobInterviewStage) => {
        return {
          interviewStageId: jobInterviewStage.interviewStageId,
          interviewType: jobInterviewStage.interviewStageName,
          interviewFormat: 'structured',
          jobId: job.jobId,
          createdBy: userInfoDTO.userId,
        };
      }),
    });
    delete job.createdBy;
    delete job.jobPositionId;
    delete job.jobDepartmentId;
    delete job.deadline;
    job['jobPositionName'] = jobPosition.jobPositionName;
    job['stages'] = jobInterviewStagesToAdd;
    return job;
  }

  async listJobs(userInfoDto: UserInfoDto) {
    const jobs = await this.prisma.job.findMany({
      where: {
        createdBy: userInfoDto.userId,
      },
      include: {
        jobDepartment: {
          select: {
            jobDepartmentName: true,
          },
        },
        jobPosition: {
          select: {
            jobPositionName: true,
          },
        },
        JobInterviewStage: {
          select: {
            interviewFormat: true,
            interviewType: true,
          },
        },
        candidate: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return jobs;
  }
}
