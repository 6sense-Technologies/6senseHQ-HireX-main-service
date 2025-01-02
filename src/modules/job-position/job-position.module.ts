import { Module } from '@nestjs/common';
import { JobPositionController } from './job-position.controller';
import { JobPositionService } from './job-position.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [JobPositionController],
  providers: [JobPositionService, PrismaService],
})
export class JobPositionModule {}
