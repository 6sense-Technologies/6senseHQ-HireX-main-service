import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpServer,
} from '@nestjs/common';
import { AbstractHttpAdapter, BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { SentryExceptionCaptured } from '@sentry/nestjs';
@Catch()
export class SentryFilter extends BaseExceptionFilter {
  @SentryExceptionCaptured()
  handleUnknownError(
    exception: HttpException,
    host: ArgumentsHost,
    applicationRef: HttpServer<any, any> | AbstractHttpAdapter<any, any, any>,
  ) {
    Sentry.captureException(exception);
    super.handleUnknownError(exception, host, applicationRef);
  }
}
