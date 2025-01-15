import { VideoUsers } from '@core/modules/video/entities/video-users';

export abstract class VideoUsersRepository {
  abstract create(data: VideoUsers): Promise<VideoUsers>;

  abstract getAllByUsers(user_id: string): Promise<VideoUsers[]>;
}
