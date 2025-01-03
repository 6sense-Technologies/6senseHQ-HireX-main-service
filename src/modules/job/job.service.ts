import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service'; // Assuming PrismaService is in your `prisma` directory
import { CreateJobDtoUsingName, UserInfoDto } from './dto/job.dto';
import { InterviewStage, Job } from '@prisma/client';

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
    const jobInterviewStagesToAdd: InterviewStage[] = [];
    for (let i = 0; i < interviewStages.length; i += 1) {
      const interviewStage: InterviewStage =
        await this.prisma.interviewStage.findFirst({
          where: {
            interviewStageName: interviewStages[i].interviewStageName,
          },
        });
      if (!interviewStage) {
        // interviewStage = await this.prisma.interviewStage.create({
        //   data: {
        //     interviewStageName: interviewStages[i].interviewStageName,
        //     createdBy: userInfoDTO.userId,
        //   },
        // });//use let
        throw new BadRequestException('One or more interview stage is invalid');
      }
      jobInterviewStagesToAdd.push(interviewStage);
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
    const stagesAdded = [];
    for (let i = 0; i < jobInterviewStagesToAdd.length; i += 1) {
      const stage = await this.prisma.jobInterviewStage.create({
        data: {
          interviewStageId: jobInterviewStagesToAdd[i].interviewStageId,
          interviewType: jobInterviewStagesToAdd[i].interviewStageName,
          interviewFormat: 'structured',
          jobId: job.jobId,
          createdBy: userInfoDTO.userId,
        },
      });
      stagesAdded.push(stage);
    }
    delete job.createdBy;
    delete job.jobPositionId;
    delete job.jobDepartmentId;
    delete job.deadline;
    job['jobPositionName'] = jobPosition.jobPositionName;
    job['stages'] = stagesAdded;
    return job;
  }

  async listJobs() {
    const jobs = await this.prisma.job.findMany();
    for (let i = 0; i < jobs.length; i += 1) {
      let department = null;
      if (jobs[i].jobDepartmentId != null) {
        department = await this.prisma.jobDepartment.findFirst({
          where: {
            jobDepartmentId: jobs[i].jobDepartmentId,
          },
        });
      }
      const position = await this.prisma.jobPosition.findFirst({
        where: {
          jobPositionId: jobs[i].jobPositionId,
        },
      });
      const interviewStages = await this.prisma.jobInterviewStage.findMany({
        where: {
          jobId: jobs[i].jobId,
        },
      });
      delete jobs[i].jobDepartmentId;
      delete jobs[i].jobPositionId;
      delete jobs[i].deadline;
      if (department !== null) {
        jobs[i]['jobDepartmentName'] = department.jobDepartmentName;
      }
      jobs[i]['jobPositionName'] = position.jobPositionName;
      jobs[i]['interviewStages'] = interviewStages;
    }
    return jobs;
  }
}
