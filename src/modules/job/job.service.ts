import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service'; // Assuming PrismaService is in your `prisma` directory
import { CreateJobDtoUsingName } from './dto/job.dto';
import { Job } from '@prisma/client';
import { UserInfoDto } from '../user/dto/user.dto';
import { isMongoId } from 'class-validator';
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

    const interviewStagesFound = await this.prisma.interviewStage.findMany({
      where: {
        interviewStageName: {
          in: interviewStages.map(
            (interviewStage) => interviewStage.interviewStageName,
          ),
        },
      },
    });

    // Ensure all provided interview stages are valid
    if (interviewStagesFound.length !== interviewStages.length) {
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
    const jobInterviewStagesToAdd = interviewStagesFound.map(
      (jobInterviewStage, index) => {
        return {
          interviewStageId: jobInterviewStage.interviewStageId,
          interviewType: jobInterviewStage.interviewStageName,
          interviewMedium: interviewStages[index].interviewMedium,
          interviewFormat: 'structured',
          jobId: job.jobId,
          createdBy: userInfoDTO.userId,
        };
      },
    );
    await this.prisma.jobInterviewStage.createMany({
      data: jobInterviewStagesToAdd,
    });
    delete job.createdBy;
    delete job.jobPositionId;
    delete job.jobDepartmentId;
    delete job.deadline;
    job['jobPositionName'] = jobPosition.jobPositionName;
    job['stages'] = jobInterviewStagesToAdd;
    return job;
  }

  async listJobs(
    userInfoDto: UserInfoDto,
    page: string = '1',
    limit: string = '10',
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const offset = (pageNumber - 1) * limitNumber;

    const jobs = await this.prisma.job.findMany({
      where: {
        createdBy: userInfoDto.userId,
      },
      select: {
        jobId: true,
        jobPosition: {
          select: {
            jobPositionName: true,
          },
        },
        jobDepartment: {
          select: {
            jobDepartmentName: true,
          },
        },
        vacancy: true,
        createdAt: true,
        createdByUser: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limitNumber,
    });
    const totalCount = await this.prisma.job.count({
      where: {
        createdBy: userInfoDto.userId,
      },
    });
    // const [jobs, totalCount] = await this.prisma.$transaction([
    //   this.prisma.job.findMany({
    //     where: { createdBy: userInfoDto.userId },
    //     select: {
    //       jobId: true,
    //       jobPosition: { select: { jobPositionName: true } },
    //       jobDepartment: { select: { jobDepartmentName: true } },
    //       vacancy: true,
    //       createdAt: true,
    //       createdByUser: { select: { name: true } },
    //     },
    //     orderBy: { createdAt: 'desc' },
    //     skip: offset,
    //     take: limitNumber,
    //   }),
    //   this.prisma.job.count({
    //     where: { createdBy: userInfoDto.userId },
    //   }),
    // ]);

    return {
      jobs: jobs.map((job) => {
        return {
          jobId: job.jobId,
          jobPosition: job.jobPosition.jobPositionName,
          numberOfVacancies: job.vacancy,
          createdBy: job.createdByUser.name,
          createdAt: job.createdAt.toLocaleDateString('en-GB'),
        };
      }),

      meta: {
        totalCount,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
      },
    };
  }

  async viewJob(userInfoDto: UserInfoDto, jobId: string) {
    if (!isMongoId(jobId)) {
      throw new NotFoundException('Job not found');
    }
    const job = await this.prisma.job.findFirst({
      where: {
        AND: {
          jobId: jobId,
          createdBy: userInfoDto.userId,
        },
      },
      select: {
        vacancy: true,
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
      },
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }
}
