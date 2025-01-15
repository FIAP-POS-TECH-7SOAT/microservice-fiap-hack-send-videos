import { UniqueEntityID } from '@core/common/entities/unique-entity-id';

import { VideoUsers } from '@core/modules/video/entities/video-users';
import { VideoUsers as VideoUsersPrisma } from '@prisma/client';

export class VideoUsersMapping {
  static toDomain({ created_at, id, url, user_id }: VideoUsersPrisma) {
    return VideoUsers.create(
      {
        created_at,
        url,
        user_id,
      },
      new UniqueEntityID(id),
    );
  }

  static toPrisma(videoUser: VideoUsers) {
    return {
      id: videoUser.id.toString(),
      user_id: videoUser.user_id,
      url: videoUser.url,
      created_at: videoUser.created_at,
    };
  }
}
