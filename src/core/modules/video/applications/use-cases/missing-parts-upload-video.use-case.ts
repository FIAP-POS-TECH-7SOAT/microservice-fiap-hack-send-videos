import { Injectable } from '@nestjs/common';
import { Either, right } from '@core/common/entities/either';

import { UploadVideoFailsError } from '../errors/upload-video-fails.error';
import { CacheProvider } from '../ports/providers/cache.provider';

type PartsUploadFile = { ETag: string; PartNumber: number };
interface RequestProps {
  file_name: string;
  user_id: string;
}
type ResponseProps = Either<
  UploadVideoFailsError,
  {
    upload_id?: string;
    missing_parts: number[];
  }
>;
@Injectable()
export class MissingPartsUploadVideoUseCase {
  constructor(private readonly redisService: CacheProvider) {}
  async execute({ file_name, user_id }: RequestProps): Promise<ResponseProps> {
    const fileName = `${user_id}_${file_name}`;
    const redis = await this.redisService.get<{
      uploadId: string;
      totalParts: number;
      parts: PartsUploadFile[];
    }>(`upload:${fileName}`);

    const missingNumbers = Array.from(
      { length: redis?.totalParts || 0 },
      (_, i) => i + 1,
    ).filter((num) => !redis.parts.some((p) => p.PartNumber === num));

    return right({
      upload_id: redis?.uploadId,
      missing_parts: missingNumbers,
    });
  }
}
