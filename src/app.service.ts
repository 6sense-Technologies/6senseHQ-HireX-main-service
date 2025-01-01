import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  getHello(): string {
    return 'Hirex app';
  }
  async getDummyUsers(): Promise<any> {
    const result = await this.prisma.user.findMany();
    return result;
  }
}
