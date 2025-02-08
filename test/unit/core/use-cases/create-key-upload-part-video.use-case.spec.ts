import { CreateKeyUploadPartVideoUseCase } from '@core/modules/video/applications/use-cases/create-key-upload-part-video.use-case';

import { right } from '@core/common/entities/either';
import { CacheProvider } from '@core/modules/video/applications/ports/providers/cache.provider';
import { FakeUploadFileProvider } from '../providers/fake-upload-file-provider';
import { UploadFileProvider } from '@core/modules/video/applications/ports/providers/upload-file';
import { LoggerProvider } from '@core/common/ports/logger.provider';
import { FakeCacheProvider } from '../providers/fake-cache-provider';

describe('CreateKeyUploadPartVideoUseCase', () => {
  let sut: CreateKeyUploadPartVideoUseCase;
  let fakeCacheProvider: CacheProvider;
  let fakeUploadFileProvider: UploadFileProvider;
  let fakeLoggerProvider: LoggerProvider;

  beforeEach(() => {
    fakeLoggerProvider = {
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    };
    fakeCacheProvider = new FakeCacheProvider();
    fakeUploadFileProvider = new FakeUploadFileProvider(fakeLoggerProvider);
    sut = new CreateKeyUploadPartVideoUseCase(
      fakeCacheProvider,
      fakeUploadFileProvider,
    );
  });

  it('should return the existing upload id if it exists in cache', async () => {
    const fileName = 'video.mp4';
    const userId = 'user123';
    const totalParts = 5;
    const cacheKey = `upload:${userId}_${fileName}`;

    // Pre-define a cache entry
    await fakeCacheProvider.set(cacheKey, {
      uploadId: 'existing-upload-id',
      totalParts,
      parts: [],
    });

    const result = await sut.execute({
      file_name: fileName,
      user_id: userId,
      total_parts: totalParts,
    });

    expect(result).toEqual(right({ upload_id: 'existing-upload-id' }));
  });

  it('should generate a new upload id and store it in cache if it does not exist', async () => {
    const fileName = 'video.mp4';
    const userId = 'user123';
    const totalParts = 5;
    const cacheKey = `upload:${userId}_${fileName}`;

    const now = Date.now();
    const result = await sut.execute({
      file_name: fileName,
      user_id: userId,
      total_parts: totalParts,
    });

    // Check if the upload id was generated
    expect(result).toEqual(
      right({ upload_id: `${userId}_${fileName}_${now}` }),
    );

    // Verify that the cache was set
    const cachedData = await fakeCacheProvider.get(cacheKey);
    expect(cachedData).toEqual({
      uploadId: `${userId}_${fileName}_${now}`,
      totalParts,
      parts: [],
    });
  });
});
