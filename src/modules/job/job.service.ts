import { BadRequestException, Injectable } from '@nestjs/common';
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

    const interviewStagesMap = interviewStages.reduce((map, interviewStage) => {
      map[interviewStage.interviewStageName] = interviewStage.interviewMedium;
      return map;
    }, {});

    const jobInterviewStagesToAdd = interviewStagesFound.map(
      (interviewStageFound) => {
        const interviewFormat =
          interviewStagesMap[interviewStageFound.interviewStageName];
        if (!interviewFormat) {
          throw new BadRequestException(
            `Interview stage ${interviewStageFound.interviewStageName} is missing a format`,
          );
        }
        return {
          ...interviewStageFound,
          interviewType: interviewFormat,
        };
      },
    );

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
          interviewType: jobInterviewStage.interviewType,
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

  async listJobs(
    userInfoDto: UserInfoDto,
    offsetString: string,
    limitString: string,
  ) {
    let offset: number = parseInt(offsetString);
    let limit: number = parseInt(limitString);
    console.log(`HIT ${offset} ${limit}`);
    if (!offset || !limit) {
      offset = 1;
      limit = 5;
    }
    if (offset < 1 || limit < 1) {
      offset = 1;
      limit = 5;
    }
    const jobs = await this.prisma.job.findMany({
      skip: offset,
      take: limit,
      where: {
        createdBy: userInfoDto.userId,
      },
      select: {
        jobPosition: {
          select: {
            jobPositionName: true,
          },
        },
        vacancy: true,
        createdAt: true,
        createdBy: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    // const jobs = await this.prisma.prismaExtended.job
    //   .paginate()
    //   .withPages({ limit: 10 });
    // console.log(jobs);
    const jobCreatedBy = [];

    for (let i = 0; i < jobs.length; i += 1) {
      jobCreatedBy.push(
        await this.prisma.user.findUnique({
          where: {
            id: jobs[i].createdBy,
          },
        }),
      );
    }
    const modifiedResponse = jobs.map((job, index) => {
      return {
        ...job,
        jobPosition: job.jobPosition.jobPositionName,
        numberOfVacancies: job.vacancy,
        createdAt: job.createdAt.toLocaleDateString('en-GB'),
        createdBy: jobCreatedBy[index].email,
        vacancy: undefined,
      };
    });
    return modifiedResponse;
  }
  async viewJob(userInfoDto: UserInfoDto, jobId: string) {
    if (!isMongoId(jobId)) {
      throw new BadRequestException('Invalid Request');
    }
    const job = await this.prisma.job.findFirst({
      where: {
        AND: {
          jobId: jobId,
          createdBy: userInfoDto.userId,
        },
      },
      include: {
        jobDepartment: true,
        jobPosition: true,
      },
    });
    console.log(job);
    return job;
  }
}
