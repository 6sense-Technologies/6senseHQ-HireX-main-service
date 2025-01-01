import {
  Controller,
  Get,
  InternalServerErrorException,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Controller()
@UseInterceptors(LoggingInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/test-sentry')
  getError() {
    throw new InternalServerErrorException({
      message: 'Dummy error for sentry check',
    });
  }

  @Get('/test-prisma')
  async testPrisma() {
    return this.appService.getDummyUsers();
  }
}
