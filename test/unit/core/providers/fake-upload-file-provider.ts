import { LoggerProvider } from '@core/common/ports/logger.provider';
import {
  UploadFileProvider,
  UploadFileProviderProps,
  UploadPartFileProviderProps,
  UploadPartFileProviderResponse,
} from '@core/modules/video/applications/ports/providers/upload-file';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FakeUploadFileProvider implements UploadFileProvider {
  constructor(private readonly loggerProvider: LoggerProvider) {}
  async generateKey(fileName: string): Promise<string> {
    const key = `${fileName}_${Date.now()}`;
    this.loggerProvider.info(
      `${FakeUploadFileProvider.name} [generateKey] Generated key: ${key}`,
    );
    return key;
  }
  async upload({ file, fileName }: UploadFileProviderProps): Promise<void> {
    this.loggerProvider.info(
      `${FakeUploadFileProvider.name} [upload] Uploaded file: data ${JSON.stringify({ file, fileName })}`,
    );
  }

  async uploadPart(
    data: UploadPartFileProviderProps,
  ): Promise<UploadPartFileProviderResponse> {
    this.loggerProvider.info(
      `${FakeUploadFileProvider.name} [uploadPart] Uploaded file: data ${JSON.stringify(data)}`,
    );
    return {
      finished: true,
      id: 'fake_id',
      next_part: 1,
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
