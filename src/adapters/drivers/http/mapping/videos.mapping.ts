import { VideoUsers } from '@core/modules/video/entities/video-users';

export class VideoUserMapping {
  static toView(videoUsers: VideoUsers) {
    return {
      id: videoUsers.id.toString(),
      url: videoUsers.url,
      user_id: videoUsers.user_id,
      created_at: videoUsers.created_at,
    };
  }
}
