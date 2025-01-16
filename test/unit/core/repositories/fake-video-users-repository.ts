import { VideoUsersMapping } from '@adapters/drivens/infra/database/prisma/repositories/mapping/video-users-mapping';
import { VideoUsersRepository } from '@core/modules/video/applications/ports/repositories/video-user-repository';
import { VideoUsers } from '@core/modules/video/entities/video-users';

interface OrderRepositoryProps {
  created_at: Date;
  id: string;
  url: string;
  user_id: string;
}
export class FakeVideoUsersRepository implements VideoUsersRepository {
  private prisma: OrderRepositoryProps[] = [];
  constructor() {}
  async getAllByUsers(user_id: string): Promise<VideoUsers[]> {
    const videos = this.prisma.filter((item) => item.user_id === user_id);

    return videos.map(VideoUsersMapping.toDomain);
  }
  async create(data: VideoUsers): Promise<VideoUsers> {
    const order = VideoUsersMapping.toPrisma(data);
    this.prisma.push(order);

    return data;
  }
}
