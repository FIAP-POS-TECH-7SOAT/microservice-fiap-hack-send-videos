import { VideoUsersStatus } from '@core/modules/video/entities/video-users';

export interface FileProcessedDTO {
  id: string;
  url: string;
  status: VideoUsersStatus;
}
