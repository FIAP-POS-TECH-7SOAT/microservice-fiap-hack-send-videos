import * as path from 'node:path';
import 'winston-daily-rotate-file';
import winston, { createLogger, format, transports } from 'winston';
import { LoggerProvider } from '@core/common/ports/logger.provider';

export class WinstonLoggerProvider implements LoggerProvider {
  private logger: winston.Logger;
  constructor() {
    const transport = new winston.transports.DailyRotateFile({
      level: 'info',
      filename: path.join('logs', 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    });
    const logConfiguration = {
      level: 'info',
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        }),
      ),
      transports: [new transports.Console(), transport],
    };

    this.logger = createLogger(logConfiguration);
  }
  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }
}
