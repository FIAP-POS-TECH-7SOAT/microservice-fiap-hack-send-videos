import { Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

import { VideoUsersRepository } from '@core/modules/video/applications/ports/repositories/video-user-repository';
import { PrismaVideoUsersRepository } from './repositories/prisma-video-users-repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: VideoUsersRepository,
      useClass: PrismaVideoUsersRepository,
    },
  ],
  exports: [PrismaService, VideoUsersRepository],
})
export default class DatabaseModule {}
