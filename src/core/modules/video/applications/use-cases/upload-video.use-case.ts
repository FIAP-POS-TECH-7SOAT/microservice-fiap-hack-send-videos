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
  title: string;
}
type ResponseProps = Either<
  UploadVideoFailsError,
  {
    ok: boolean;
  }
>;
@Injectable()
export class UploadVideoUseCase {
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
    title,
  }: RequestProps): Promise<ResponseProps> {
    const fileName = `${user_id}_${file.originalname}`;
    const video = VideoUsers.create({
      url: fileName,
      user_id,
      email,
      phone,
      title,
    });
    try {
      await this.uploadFileProvider.upload({ file, fileName });

      await this.videoUsersRepository.create(video);
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
      return right({ ok: true });
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
      return left(new UploadVideoFailsError());
    }
  }
}
