import { Module } from '@nestjs/common';
import { JobDepartmentController } from './job-department.controller';
import { JobDepartmentService } from './job-department.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [JobDepartmentController],
  providers: [JobDepartmentService, PrismaService],
})
export class JobDepartmentModule {}
