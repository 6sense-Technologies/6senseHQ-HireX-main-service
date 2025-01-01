import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name, {
    timestamp: true,
  });

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const report =
      'Route: ' +
      context.getArgByIndex(0).url +
      ' Method: ' +
      context.getArgByIndex(0).method;

    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.log(
            `${report} Request Logged time taken... ${Date.now() - now}ms`,
          ),
        ),
      );
  }
}
