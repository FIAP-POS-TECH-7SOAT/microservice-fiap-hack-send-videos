import { Module } from '@nestjs/common';

import { InfoController } from './controllers/info-controller';

import DatabaseModule from '@adapters/drivens/infra/database/prisma/database.module';

import { SendVideosController } from './controllers/send-video-controller';
import { SendVideosModule } from '@core/modules/video/video.module';
import { APP_FILTER } from '@nestjs/core';
import { LoggingInterceptor } from './Interceptors/custom-logger-routes';

@Module({
  imports: [DatabaseModule, SendVideosModule],
  controllers: [InfoController, SendVideosController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: LoggingInterceptor,
    },
  ],
})
export class HTTPModule {}
