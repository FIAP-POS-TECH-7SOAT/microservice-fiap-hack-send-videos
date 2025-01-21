import { Module } from '@nestjs/common';

import { UploadVideoUseCase } from './applications/use-cases/upload-video.use-case';
import { ListVideoByUserUseCase } from './applications/use-cases/list-video-by-user.use-case';
import { VideoUsersRepository } from './applications/ports/repositories/video-user-repository';
import { PrismaVideoUsersRepository } from '@adapters/drivens/infra/database/prisma/repositories/prisma-video-users-repository';
import { UpdateVideoReadyUseCase } from './applications/use-cases/update-video-ready.use-case';
import { UploadPartVideoUseCase } from './applications/use-cases/upload-part-video.use-case';
import { GetLastPartUploadVideoUseCase } from './applications/use-cases/get-last-part-upload-video.use-case';

@Module({
  imports: [],
  controllers: [],
  providers: [
    UploadVideoUseCase,
    ListVideoByUserUseCase,
    UpdateVideoReadyUseCase,
    UploadPartVideoUseCase,
    GetLastPartUploadVideoUseCase,
    {
      provide: VideoUsersRepository,
      useClass: PrismaVideoUsersRepository,
    },
  ],
  exports: [
    UploadVideoUseCase,
    ListVideoByUserUseCase,
    UpdateVideoReadyUseCase,
    UploadPartVideoUseCase,
    GetLastPartUploadVideoUseCase,
  ],
})
export class SendVideosModule {}
