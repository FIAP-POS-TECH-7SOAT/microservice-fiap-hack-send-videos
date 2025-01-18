import { VideoUsers } from '@core/modules/video/entities/video-users';

export abstract class VideoUsersRepository {
  abstract create(data: VideoUsers): Promise<VideoUsers>;

  abstract getAllByUsers(user_id: string): Promise<VideoUsers[]>;
  abstract getById(id: string): Promise<VideoUsers | null>;
  abstract save(data: VideoUsers): Promise<VideoUsers>;
}
