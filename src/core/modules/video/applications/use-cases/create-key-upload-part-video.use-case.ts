import { Injectable } from '@nestjs/common';
import { Either, right } from '@core/common/entities/either';

import { UploadVideoFailsError } from '../errors/upload-video-fails.error';
import { CacheProvider } from '../ports/providers/cache.provider';
import { UploadFileProvider } from '../ports/providers/upload-file';
import { GetCacheVideoUploadedResponse } from '../ports/dtos/cache.dtos';

interface RequestProps {
  file_name: string;
  user_id: string;
  total_parts: number;
}
type ResponseProps = Either<
  UploadVideoFailsError,
  {
    upload_id: string;
  }
>;
@Injectable()
export class CreateKeyUploadPartVideoUseCase {
  constructor(
    private readonly redisService: CacheProvider,
    private readonly uploadFileProvider: UploadFileProvider,
  ) {}
  async execute({
    file_name,
    user_id,
    total_parts,
  }: RequestProps): Promise<ResponseProps> {
    const fileName = `${user_id}_${file_name}`;
    const cacheKey = `upload:${fileName}`;
    const redis =
      await this.redisService.get<GetCacheVideoUploadedResponse>(cacheKey);

    if (redis?.uploadId) {
      return right({
        upload_id: redis?.uploadId,
      });
    }
    const upload_id = await this.uploadFileProvider.generateKey(fileName);

    await this.redisService.set(cacheKey, {
      uploadId: upload_id,
      totalParts: total_parts,
      parts: [],
    });

    return right({
      upload_id: upload_id,
    });
  }
}
