import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class JobPositionService {
  constructor(private readonly prisma: PrismaService) {}

  async listJobPosition(departmentName: string) {
    if (departmentName === 'all') {
      return await this.prisma.jobPosition.findMany({
        select: {
          jobPositionName: true,
        },
      });
    } else {
      return await this.prisma.jobPosition.findMany({
        where: {
          jobDepartment: {
            jobDepartmentName: departmentName,
          },
        },
        select: {
          jobPositionName: true,
        },
      });
    }
  }
}
