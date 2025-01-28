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
    part_number: number;
  }
>;
@Injectable()
export class GetLastPartUploadVideoUseCase {
  constructor(private readonly redisService: CacheProvider) {}
  async execute({ file_name, user_id }: RequestProps): Promise<ResponseProps> {
    const fileName = `${user_id}_${file_name}`;
    const redis = await this.redisService.get<{
      uploadId: string;
      parts: PartsUploadFile[];
    }>(`upload:${fileName}`);

    return right({
      part_number: redis?.parts?.length
        ? redis.parts[redis.parts.length - 1].PartNumber
        : 1,
      upload_id: redis?.uploadId,
    });
  }
}
