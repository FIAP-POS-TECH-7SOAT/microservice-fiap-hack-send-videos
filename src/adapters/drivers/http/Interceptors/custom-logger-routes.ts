import { LoggerProvider } from '@core/common/ports/logger.provider';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor, ExceptionFilter {
  constructor(private readonly logger: LoggerProvider) {}
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const now = Date.now();

    this.logger.error(
      `${LoggingInterceptor.name} ${request.method} ${request.originalUrl} ${status} - ${Date.now() - now}ms`,
    );

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { method, originalUrl } = context
      .switchToHttp()
      .getRequest<Request>();
    const { statusCode } = context.switchToHttp().getResponse<Response>();
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        if (originalUrl === '/info') {
          return null;
        }
        return this.logger.info(
          `${LoggingInterceptor.name} [${method}] ${originalUrl} ${statusCode} - ${Date.now() - now}ms`,
        );
      }),
    );
  }
}
