import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HealthModule } from './health/health.module';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { PrismaService } from './prisma.service';
import { PermissionModule } from './modules/permission/permission.module';
import { RoleModule } from './modules/role/role.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { JobModule } from './modules/job/job.module';
import { JobDepartmentModule } from './modules/job-department/job-department.module';
import { JobPositionModule } from './modules/job-position/job-position.module';
import { InterviewstageModule } from './modules/interviewstage/interviewstage.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailServiceModule } from './modules/email-service/email-service.module';
import { appConfig } from './configuration/app.config';
@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      //rate limiting config
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    MailerModule.forRoot({
      transport: {
        host: appConfig.EMAIL_HOST,
        port: appConfig.EMAIL_SERVICE_PORT,
        auth: {
          user: appConfig.EMAIL_USERNAME,
          pass: appConfig.EMAIL_PASSWORD,
        },
      },
    }),
    HealthModule,
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule,
    JobModule,
    JobDepartmentModule,
    JobPositionModule,
    InterviewstageModule,
    EmailServiceModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    PrismaService,
  ],
})
export class AppModule {}
