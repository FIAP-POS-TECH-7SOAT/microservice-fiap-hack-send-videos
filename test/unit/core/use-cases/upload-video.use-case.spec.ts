import { right } from '@core/common/entities/either';
import { FakeVideoUsersRepository } from '../repositories/fake-video-users-repository';
import { UploadVideoUseCase } from '@core/modules/video/applications/use-cases/upload-video.use-case';
import { UploadFileProvider } from '@core/modules/video/applications/ports/providers/upload-file';
import { VideoUsersRepository } from '@core/modules/video/applications/ports/repositories/video-user-repository';
import { FakeUploadFileProvider } from '../providers/fake-upload-file-provider';

describe('UploadVideoUseCase', () => {
  let sut: UploadVideoUseCase;
  let fakeUploadFileProvider: UploadFileProvider;
  let fakeVideoUsersRepository: VideoUsersRepository;

  beforeEach(() => {
    fakeUploadFileProvider = new FakeUploadFileProvider();
    fakeVideoUsersRepository = new FakeVideoUsersRepository();

    sut = new UploadVideoUseCase(
      fakeUploadFileProvider,
      fakeVideoUsersRepository,
    );
  });

  it('should upload the file and save the video user in the repository', async () => {
    const mockFile: Express.Multer.File = {
      originalname: 'video.mp4',
      buffer: Buffer.from('fake-file-content'),
    } as any;
    const mockUserId = 'user123';

    const result = await sut.execute({
      file: mockFile,
      user_id: mockUserId,
    });

    const repo = await fakeVideoUsersRepository.getAllByUsers(mockUserId);
    expect(repo).toHaveLength(1);

    expect(result).toEqual(right({ ok: true }));
  });
});
