import { PrismaService } from '../prisma.service';
import { VideoUsersMapping } from './mapping/video-users-mapping';

import { Injectable } from '@nestjs/common';
import { VideoUsersRepository } from '@core/modules/video/applications/ports/repositories/video-user-repository';
import { VideoUsers } from '@core/modules/video/entities/video-users';

@Injectable()
export class PrismaVideoUsersRepository implements VideoUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllByUsers(user_id: string): Promise<VideoUsers[]> {
    const videos = await this.prisma.videoUsers.findMany({
      where: {
        user_id,
      },

      orderBy: {
        created_at: 'asc',
      },
    });

    return videos.map(VideoUsersMapping.toDomain);
  }

  async create(videoUser: VideoUsers): Promise<VideoUsers> {
    await this.prisma.videoUsers.create({
      data: VideoUsersMapping.toPrisma(videoUser),
    });

    return videoUser;
  }
}
