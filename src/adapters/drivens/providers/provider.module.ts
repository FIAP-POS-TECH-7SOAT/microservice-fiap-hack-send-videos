import { Module } from '@nestjs/common';
import { S3UploadFileProvider } from './s3-upload-file';
import { UploadFileProvider } from '@core/modules/video/applications/ports/providers/upload-file';
import { EnvService } from '../infra/envs/env.service';
import { RedisCacheProvider } from './redis.provider';
import { CacheProvider } from '@core/modules/video/applications/ports/providers/cache.provider';

@Module({
  providers: [
    {
      provide: UploadFileProvider,
      useClass: S3UploadFileProvider,
    },

    {
      provide: CacheProvider,
      useClass: RedisCacheProvider,
    },
    EnvService,
  ],

  exports: [UploadFileProvider, CacheProvider],
})
export class ProviderModule {}
