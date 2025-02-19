import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class JobPositionService {
  constructor(private readonly prisma: PrismaService) {}

  async listJobPosition() {
    return await this.prisma.jobPosition.findMany();
  }
}
