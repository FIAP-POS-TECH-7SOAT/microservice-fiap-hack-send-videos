import { Injectable } from '@nestjs/common';
import { Either, right } from '@core/common/entities/either';
import { UploadFileProvider } from '../ports/providers/upload-file';
import { VideoUsersRepository } from '../ports/repositories/video-user-repository';
import { VideoUsers } from '../../entities/video-users';

interface RequestProps {
  file: Express.Multer.File;
  user_id: string;
}
type ResponseProps = Either<
  void,
  {
    ok: boolean;
  }
>;
@Injectable()
export class UploadVideoUseCase {
  constructor(
    private readonly uploadFileProvider: UploadFileProvider,
    private readonly videoUsersRepository: VideoUsersRepository,
  ) {}
  async execute({ file, user_id }: RequestProps): Promise<ResponseProps> {
    const fileName = `${user_id}_${file.originalname}`;
    await this.uploadFileProvider.upload({ file, fileName });
    const video = VideoUsers.create({
      url: fileName,
      user_id,
    });
    await this.videoUsersRepository.create(video);
    return right({ ok: true });
  }
}
