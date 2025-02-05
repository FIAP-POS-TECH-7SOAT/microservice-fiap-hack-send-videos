import { VideoUsersMapping } from '@adapters/drivens/infra/database/prisma/repositories/mapping/video-users-mapping';
import { VideoUsersRepository } from '@core/modules/video/applications/ports/repositories/video-user-repository';
import { VideoUsers } from '@core/modules/video/entities/video-users';

interface VideoUsersRepositoryProps {
  created_at: Date;
  title: string;
  id: string;
  url: string;
  user_id: string;
  email: string;
  phone: string;
  status: string;
  updated_at: Date;
}
export class FakeVideoUsersRepository implements VideoUsersRepository {
  private prisma: VideoUsersRepositoryProps[] = [];
  constructor() {}
  async getById(id: string): Promise<VideoUsers | null> {
    const videoUser = this.prisma.find((item) => item.id === id);

    if (!videoUser) {
      return null;
    }
    return VideoUsersMapping.toDomain(videoUser);
  }
  async save(data: VideoUsers): Promise<VideoUsers> {
    this.prisma.push(VideoUsersMapping.toPrisma(data));
    return data;
  }
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
