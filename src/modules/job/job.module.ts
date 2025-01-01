import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [JobService, PrismaService],
  controllers: [JobController],
})
export class JobModule {}
