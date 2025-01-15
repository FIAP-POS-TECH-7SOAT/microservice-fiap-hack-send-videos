import { Injectable } from '@nestjs/common';
import { Either, right } from '@core/common/entities/either';

import { VideoUsersRepository } from '../ports/repositories/video-user-repository';
import { VideoUsers } from '../../entities/video-users';

interface RequestProps {
  id: string;
}
type ResponseProps = Either<
  void,
  {
    videos: VideoUsers[];
  }
>;
@Injectable()
export class ListVideoByUserUseCase {
  constructor(private readonly videoUsersRepository: VideoUsersRepository) {}
  async execute({ id }: RequestProps): Promise<ResponseProps> {
    const videos = await this.videoUsersRepository.getAllByUsers(id);
    return right({ videos });
  }
}
