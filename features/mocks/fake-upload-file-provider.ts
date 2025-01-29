import { LoggerProvider } from '@core/common/ports/logger.provider';
import {
  UploadFileProvider,
  UploadFileProviderProps,
  UploadPartFileProviderProps,
  UploadPartFileProviderResponse,
} from '@core/modules/video/applications/ports/providers/upload-file';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

@Injectable()
export class FakeUploadFileProvider implements UploadFileProvider {
  constructor(private readonly loggerProvider: LoggerProvider) {}
  async upload({ file, fileName }: UploadFileProviderProps): Promise<void> {
    this.loggerProvider.info(
      `${FakeUploadFileProvider.name} [upload] Uploaded file: data ${JSON.stringify({ file, fileName })}`,
    );
  }

  async uploadPart(
    data: UploadPartFileProviderProps,
  ): Promise<UploadPartFileProviderResponse> {
    let upload_id = data.uploadId;
    this.loggerProvider.info(
      `${FakeUploadFileProvider.name} [uploadPart] Uploaded file: data ${JSON.stringify(data)}`,
    );
    if (!upload_id) {
      upload_id = randomUUID();
    }
    return {
      finished: true,
      id: upload_id,
      next_part: (data.partNumber || 0) + 1,
    };
  }
  async resumeUpload(
    fileName: string,
    uploadId: string,
    parts: { ETag: string; PartNumber: number }[],
  ): Promise<void> {
    this.loggerProvider.info(
      `${FakeUploadFileProvider.name} [resumeUpload] Resume file : data ${JSON.stringify({ fileName, uploadId, parts })}`,
    );
  }
}
