import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service'; // Assuming PrismaService is in your `prisma` directory
import { CreateJobDtoUsingName } from './dto/job.dto';

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new job
  async createJob(createJobDto: CreateJobDtoUsingName) {
    const {
      jobResponsibility,
      jobKeywords,
      vacancy,
      createdByEmail,
      jobPositionName,
      jobDepartmentName,
    } = createJobDto;
    // console.log(createJobDto);

    // const findJob = await this.prisma.job.findFirst({
    //   where: {
    //     jobName: jobName,
    //   },
    // });
    // if (findJob) {
    //   throw new ConflictException('Job with this name already exists');
    // }
    const user = await this.prisma.user.findUnique({
      where: { email: createdByEmail },
    });
    if (!user) {
      throw new BadRequestException('User with this email not found');
    }
    const jobPosition = await this.prisma.jobPosition.findFirst({
      where: {
        jobPositionName: jobPositionName,
      },
    });
    if (!jobPosition) {
      throw new BadRequestException('Job Position is not valid');
    }
    let queryDept = 'None';
    if (jobDepartmentName !== undefined) {
      queryDept = jobDepartmentName;
    }
    const jobDepartment = await this.prisma.jobDepartment.findFirst({
      where: {
        jobDepartmentName: queryDept,
      },
    });
    if (!jobDepartment) {
      throw new BadRequestException('Job department is not valid');
    }
    const createUserId = user.id;

    const createjobDepartmentId = jobDepartment?.jobDepartmentId;
    const createjobPositionId = jobPosition?.jobPositionId;

    const job = await this.prisma.job.create({
      data: {
        jobResponsibility,
        jobKeywords,
        vacancy,
        createdBy: createUserId,
        jobDepartmentId: createjobDepartmentId,
        jobPositionId: createjobPositionId,
      },
    });
    delete job.createdBy;
    delete job.jobPositionId;
    delete job.jobDepartmentId;
    job['jobPositionName'] = jobPosition.jobPositionName;
    job['jobDepartmentName'] = jobDepartment.jobDepartmentName;
    delete job.deadline;
    return job;
  }
  async listJobs() {
    const jobs = await this.prisma.job.findMany();
    for (let i = 0; i < jobs.length; i += 1) {
      const department = await this.prisma.jobDepartment.findFirst({
        where: {
          jobDepartmentId: jobs[i].jobDepartmentId,
        },
      });
      const position = await this.prisma.jobPosition.findFirst({
        where: {
          jobPositionId: jobs[i].jobPositionId,
        },
      });
      delete jobs[i].jobDepartmentId;
      delete jobs[i].jobPositionId;
      delete jobs[i].deadline;
      jobs[i]['jobDepartmentName'] = department.jobDepartmentName;
      jobs[i]['jobPositionName'] = position.jobPositionName;
    }
    return jobs;
  }
}
