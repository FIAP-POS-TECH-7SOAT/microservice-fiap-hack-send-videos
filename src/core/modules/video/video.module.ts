import { Module } from '@nestjs/common';

import { UploadVideoUseCase } from './applications/use-cases/upload-video.use-case';
import { ListVideoByUserUseCase } from './applications/use-cases/list-video-by-user.use-case';
import { VideoUsersRepository } from './applications/ports/repositories/video-user-repository';
import { PrismaVideoUsersRepository } from '@adapters/drivens/infra/database/prisma/repositories/prisma-video-users-repository';

@Module({
  imports: [],
  controllers: [],
  providers: [
    UploadVideoUseCase,
    ListVideoByUserUseCase,
    {
      provide: VideoUsersRepository,
      useClass: PrismaVideoUsersRepository,
    },
  ],
  exports: [UploadVideoUseCase, ListVideoByUserUseCase],
})
export class SendVideosModule {}
