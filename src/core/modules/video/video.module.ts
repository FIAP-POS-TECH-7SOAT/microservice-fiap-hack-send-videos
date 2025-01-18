import { Module } from '@nestjs/common';

import { UploadVideoUseCase } from './applications/use-cases/upload-video.use-case';
import { ListVideoByUserUseCase } from './applications/use-cases/list-video-by-user.use-case';
import { VideoUsersRepository } from './applications/ports/repositories/video-user-repository';
import { PrismaVideoUsersRepository } from '@adapters/drivens/infra/database/prisma/repositories/prisma-video-users-repository';
import { UpdateVideoReadyUseCase } from './applications/use-cases/update-video-ready.use-case';

@Module({
  imports: [],
  controllers: [],
  providers: [
    UploadVideoUseCase,
    ListVideoByUserUseCase,
    UpdateVideoReadyUseCase,
    {
      provide: VideoUsersRepository,
      useClass: PrismaVideoUsersRepository,
    },
  ],
  exports: [
    UploadVideoUseCase,
    ListVideoByUserUseCase,
    UpdateVideoReadyUseCase,
  ],
})
export class SendVideosModule {}
