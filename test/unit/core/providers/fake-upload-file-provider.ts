import {
  UploadFileProvider,
  UploadFileProviderProps,
} from '@core/modules/video/applications/ports/providers/upload-file';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FakeUploadFileProvider implements UploadFileProvider {
  private client: any;
  private PART_SIZE = 5 * 1024 * 1024; // 5MB
  private BUCKET_NAME: string;

  async upload({ file, fileName }: UploadFileProviderProps): Promise<void> {
    console.log('Uploaded file:', fileName, file);
  }

  async resumeUpload(
    fileName: string,
    uploadId: string,
    parts: { ETag: string; PartNumber: number }[],
  ): Promise<void> {
    console.log('Uploaded file:', fileName, uploadId, parts);
  }
}
