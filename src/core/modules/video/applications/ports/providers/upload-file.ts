export type UploadFileProviderProps = {
  file: Express.Multer.File;
  fileName: string;
};
export type UploadPartFileProviderProps = {
  file: Express.Multer.File;
  fileName: string;
  uploadId?: string;
  partNumber: number;
  totalParts: number;
};
export type UploadPartFileProviderResponse = {
  id: string;
  next_part: number;
  finished: boolean;
};
export abstract class UploadFileProvider {
  abstract uploadPart(
    data: UploadPartFileProviderProps,
  ): Promise<UploadPartFileProviderResponse>;
  abstract upload(data: UploadFileProviderProps): Promise<void>;
  abstract resumeUpload(
    fileName: string,
    uploadId: string,
    parts: { ETag: string; PartNumber: number }[],
  ): Promise<void>;
}
