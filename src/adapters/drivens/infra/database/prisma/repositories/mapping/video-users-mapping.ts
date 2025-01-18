import { UniqueEntityID } from '@core/common/entities/unique-entity-id';

import {
  VideoUsers,
  VideoUsersStatus,
} from '@core/modules/video/entities/video-users';
import { VideoUsers as VideoUsersPrisma } from '@prisma/client';

export class VideoUsersMapping {
  static toDomain({
    created_at,
    id,
    url,
    user_id,
    email,
    phone,
    status,
    updated_at,
  }: VideoUsersPrisma) {
    return VideoUsers.create(
      {
        created_at,
        url,
        email,
        phone,
        status: status as VideoUsersStatus,
        updated_at,
        user_id,
      },
      new UniqueEntityID(id),
    );
  }

  static toPrisma(videoUser: VideoUsers) {
    return {
      id: videoUser.id.toString(),
      created_at: videoUser.created_at,
      url: videoUser.url,
      email: videoUser.email,
      phone: videoUser.phone,
      status: videoUser.status,
      updated_at: videoUser.updated_at,
      user_id: videoUser.user_id,
    };
  }
}
