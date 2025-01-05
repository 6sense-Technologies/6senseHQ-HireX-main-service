import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../prisma.service';
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private readonly disk: DiskHealthIndicator,
    private http: HttpHealthIndicator,
    private prismaorm: PrismaHealthIndicator,
    private prismaService: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com/'),
      () => this.http.pingCheck('sentry-endpoint', 'https://sentry.io'),
      () => this.prismaorm.pingCheck('Mongodb-check', this.prismaService),
    ]);
  }
}
