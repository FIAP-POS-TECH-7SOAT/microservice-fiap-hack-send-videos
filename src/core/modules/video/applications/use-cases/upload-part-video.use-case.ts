import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@core/common/entities/either';
import { UploadFileProvider } from '../ports/providers/upload-file';
import { VideoUsersRepository } from '../ports/repositories/video-user-repository';
import { VideoUsers } from '../../entities/video-users';
import { PublishMessagingProvider } from '../ports/providers/publish-messaging.provider';
import { UploadVideoFailsError } from '../errors/upload-video-fails.error';

interface RequestProps {
  file: Express.Multer.File;
  user_id: string;
  email: string;
  phone: string;
  uploadId?: string;
  partNumber: number;
  totalParts: number;
}
type ResponseProps = Either<
  UploadVideoFailsError,
  {
    id: string;
    next_part: number;
  }
>;
@Injectable()
export class UploadPartVideoUseCase {
  constructor(
    private readonly uploadFileProvider: UploadFileProvider,
    private readonly videoUsersRepository: VideoUsersRepository,
    private readonly publishMessagingProvider: PublishMessagingProvider,
  ) {}
  async execute({
    file,
    user_id,
    email,
    phone,
    uploadId,
    partNumber,
    totalParts,
  }: RequestProps): Promise<ResponseProps> {
    const fileName = `${user_id}_${file.originalname}`;
    const video = VideoUsers.create({
      title: fileName,
      url: fileName,
      user_id,
      email,
      phone,
    });
    try {
      const { id, next_part, finished } =
        await this.uploadFileProvider.uploadPart({
          file,
          fileName,
          partNumber: Number(partNumber),
          uploadId,
          totalParts: Number(totalParts),
        });

      await this.videoUsersRepository.create(video);

      if (finished) {
        await this.publishMessagingProvider.publish({
          data: JSON.stringify({
            id: video.id.toString(),
            file: fileName,
            user_id: video.user_id,
            email: video.email,
            phone: video.phone,
            status: video.status,
            created_at: video.created_at,
            updated_at: video.updated_at,
          }),
          options: {
            exchange: 'amq.direct',
            routingKey: 'file:uploaded',
          },
        });
      }

      return right({ id, next_part });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_: any) {
      await this.publishMessagingProvider.publish({
        data: JSON.stringify({
          html: '<p>Não foi possivel carregar seu video, tente novamente</p>',
          subject: 'Upload de video falhou',
          text: 'Não foi possivel carregar seu video, tente novamente',
          to: video.email,
        }),
        options: {
          exchange: 'amq.direct',
          routingKey: 'notification:email',
        },
      });
      await this.publishMessagingProvider.publish({
        data: JSON.stringify({
          message: 'Seu video comecou a ser processado',
          phone: video.phone,
        }),
        options: {
          exchange: 'amq.direct',
          routingKey: 'notification:sms',
        },
      });
      video.status = 'error';
      await this.videoUsersRepository.save(video);
      return left(new UploadVideoFailsError());
    }
  }
}
