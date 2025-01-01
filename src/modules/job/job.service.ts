import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service'; // Assuming PrismaService is in your `prisma` directory
import { CreateJobDto } from './dto/job.dto';

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new job
  async createJob(createJobDto: CreateJobDto) {
    const {
      jobName,
      deadline,
      jobDescription,
      jobKeywords,
      vacancy,
      createdBy,
      jobPositionId,
      jobDepartmentId,
      candidateId,
    } = createJobDto;
    // const jobName = this.prisma.jobDepartment.findUnique(jobPositionId);
    const job = await this.prisma.job.create({
      data: {
        jobName,
        deadline,
        jobDescription,
        jobKeywords,
        vacancy,
        createdBy,
        jobPositionId,
        jobDepartmentId,
        candidateId,
      },
    });

    return job;
  }
  async listJobs() {
    return await this.prisma.job.findMany();
  }
}
