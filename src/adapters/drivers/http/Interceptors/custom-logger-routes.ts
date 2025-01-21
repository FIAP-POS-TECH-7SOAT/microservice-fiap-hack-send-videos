import { LoggerProvider } from '@core/common/ports/logger.provider';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerProvider) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { method, originalUrl } = context
      .switchToHttp()
      .getRequest<Request>();
    const { statusCode } = context.switchToHttp().getResponse<Response>();
    const now = Date.now();

    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.info(
            `${method} ${originalUrl} ${statusCode} - ${Date.now() - now}ms`,
          ),
        ),
      );
  }
}
