import { Module } from '@nestjs/common';

import { UploadVideoUseCase } from './applications/use-cases/upload-video.use-case';
import { ListVideoByUserUseCase } from './applications/use-cases/list-video-by-user.use-case';
import { VideoUsersRepository } from './applications/ports/repositories/video-user-repository';
import { PrismaVideoUsersRepository } from '@adapters/drivens/infra/database/prisma/repositories/prisma-video-users-repository';
import { UpdateVideoStatusUseCase } from './applications/use-cases/update-video-status.use-case';
import { UploadPartVideoUseCase } from './applications/use-cases/upload-part-video.use-case';

import { MissingPartsUploadVideoUseCase } from './applications/use-cases/missing-parts-upload-video.use-case';
import { CreateKeyUploadPartVideoUseCase } from './applications/use-cases/create-key-upload-part-video.use-case';

@Module({
  imports: [],
  controllers: [],
  providers: [
    UploadVideoUseCase,
    ListVideoByUserUseCase,
    UpdateVideoStatusUseCase,
    UploadPartVideoUseCase,

    MissingPartsUploadVideoUseCase,
    CreateKeyUploadPartVideoUseCase,
    {
      provide: VideoUsersRepository,
      useClass: PrismaVideoUsersRepository,
    },
  ],
  exports: [
    UploadVideoUseCase,
    ListVideoByUserUseCase,
    UpdateVideoStatusUseCase,
    UploadPartVideoUseCase,

    MissingPartsUploadVideoUseCase,
    CreateKeyUploadPartVideoUseCase,
  ],
})
export class SendVideosModule {}
