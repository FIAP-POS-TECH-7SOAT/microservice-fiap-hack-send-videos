import { Module } from '@nestjs/common';

import { InfoController } from './controllers/info-controller';

import DatabaseModule from '@adapters/drivens/infra/database/prisma/database.module';

import { SendVideosController } from './controllers/send-video-controller';
import { SendVideosModule } from '@core/modules/video/video.module';

@Module({
  imports: [DatabaseModule, SendVideosModule],
  controllers: [InfoController, SendVideosController],
})
export class HTTPModule {}
