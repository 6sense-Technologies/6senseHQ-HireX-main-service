import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class JobDepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  async listJobDepartment() {
    return await this.prisma.jobDepartment.findMany();
  }
}
