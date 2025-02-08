import { ListVideoByUserUseCase } from '@core/modules/video/applications/use-cases/list-video-by-user.use-case';
import { VideoUsersRepository } from '@core/modules/video/applications/ports/repositories/video-user-repository';
import { VideoUsers } from '@core/modules/video/entities/video-users';
import { right } from '@core/common/entities/either';
import { FakeVideoUsersRepository } from '../repositories/fake-video-users-repository';
import { UniqueEntityID } from '@core/common/entities/unique-entity-id';

describe('ListVideoByUserUseCase', () => {
  let sut: ListVideoByUserUseCase;
  let fakeVideoUsersRepository: VideoUsersRepository;

  beforeEach(() => {
    fakeVideoUsersRepository = new FakeVideoUsersRepository();
    sut = new ListVideoByUserUseCase(fakeVideoUsersRepository);
  });

  it('should return the videos for the user when they exist', async () => {
    const mockUserId = '1';
    const mockVideos: VideoUsers[] = [
      VideoUsers.create(
        {
          email: 'mail@mail.com',
          phone: '99441123213',
          user_id: '1',
          status: 'uploaded',
          title: 'Video 1',
          url: 'video1.mp4',
        },
        new UniqueEntityID('1'),
      ),
      VideoUsers.create(
        {
          email: 'mail@mail.com',
          phone: '99441123213',
          user_id: '1',
          status: 'uploaded',
          title: 'Video 2',
          url: 'video2.mp4',
        },
        new UniqueEntityID('1'),
      ),
    ];

    // Adiciona vídeos ao repositório
    await fakeVideoUsersRepository.create(mockVideos[0]);
    await fakeVideoUsersRepository.create(mockVideos[1]);

    const result = await sut.execute({ id: mockUserId });

    if (result.isRight()) {
      expect(result.value.videos.length).toEqual(mockVideos.length);
    }
  });

  it('should return an empty list when no videos exist for the user', async () => {
    const mockUserId = 'user1234';

    const result = await sut.execute({ id: mockUserId });

    expect(result).toEqual(right({ videos: [] }));
  });
});
