import { Module } from '@nestjs/common';
import { S3UploadFileProvider } from './s3-upload-file';
import { UploadFileProvider } from '@core/modules/video/applications/ports/providers/upload-file';
import { EnvService } from '../infra/envs/env.service';
import { RedisCacheProvider } from './redis.provider';
import { CacheProvider } from '@core/modules/video/applications/ports/providers/cache.provider';
import { RabbitMqPublishMessagingProvider } from './rabbitmq-publish-messaging.provider';
import { PublishMessagingProvider } from '@core/modules/video/applications/ports/providers/publish-messaging.provider';
import { WinstonLoggerProvider } from './winston-logger.provider';
import { LoggerProvider } from '@core/common/ports/logger.provider';

@Module({
  providers: [
    {
      provide: UploadFileProvider,
      useClass: S3UploadFileProvider,
    },
    {
      provide: PublishMessagingProvider,
      useClass: RabbitMqPublishMessagingProvider,
    },

    {
      provide: CacheProvider,
      useClass: RedisCacheProvider,
    },
    {
      provide: LoggerProvider,
      useClass: WinstonLoggerProvider,
    },
    EnvService,
  ],

  exports: [
    UploadFileProvider,
    CacheProvider,
    PublishMessagingProvider,
    LoggerProvider,
  ],
})
export class ProviderModule {}
