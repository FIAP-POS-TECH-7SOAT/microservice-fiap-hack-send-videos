import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@core/common/entities/either';

import { VideoUsersRepository } from '../ports/repositories/video-user-repository';
import { VideoUsers, VideoUsersStatus } from '../../entities/video-users';

interface RequestProps {
  id: string;
  url?: string;
  status: VideoUsersStatus;
}
type ResponseProps = Either<
  Error,
  {
    video: VideoUsers;
  }
>;
@Injectable()
export class UpdateVideoStatusUseCase {
  constructor(private readonly videoUsersRepository: VideoUsersRepository) {}
  async execute({ id, url, status }: RequestProps): Promise<ResponseProps> {
    const video = await this.videoUsersRepository.getById(id);

    if (!video) {
      return left(new Error('Video not found'));
    }
    video.url = url ? url : video.url || '';
    video.status = status;
    await this.videoUsersRepository.save(video);

    return right({ video });
  }
}
