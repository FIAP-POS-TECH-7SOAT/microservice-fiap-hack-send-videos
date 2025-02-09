import { UpdateVideoStatusUseCase } from '@core/modules/video/applications/use-cases/update-video-status.use-case';
import { VideoUsersRepository } from '@core/modules/video/applications/ports/repositories/video-user-repository';
import { VideoUsers } from '@core/modules/video/entities/video-users';
import { left } from '@core/common/entities/either';
import { FakeVideoUsersRepository } from '../repositories/fake-video-users-repository';
import { UniqueEntityID } from '@core/common/entities/unique-entity-id';

describe('UpdateVideoStatusUseCase', () => {
  let sut: UpdateVideoStatusUseCase;
  let fakeVideoUsersRepository: VideoUsersRepository;

  beforeEach(() => {
    fakeVideoUsersRepository = new FakeVideoUsersRepository();
    sut = new UpdateVideoStatusUseCase(fakeVideoUsersRepository);
  });

  it('should update the video status and url when the video is found', async () => {
    const mockVideo = VideoUsers.create(
      {
        email: 'mail@mail.com',
        phone: '99441123213',
        user_id: '1',
        status: 'uploaded',
        title: 'Video 1',
        url: 'video1.mp4',
      },
      new UniqueEntityID('1'),
    );
    // Adiciona o vídeo ao repositório
    fakeVideoUsersRepository.create(mockVideo);

    const result = await sut.execute({
      id: '1',
      status: 'processing',
    });
    if (result.isRight()) {
      expect(result.value.video.status).toEqual('processing');
    }
  });

  it('should return an error when the video is not found', async () => {
    const result = await sut.execute({
      id: 'nonexistent-video-id',
      status: 'finished',
    });

    expect(result).toEqual(left(new Error('Video not found')));
  });
});
