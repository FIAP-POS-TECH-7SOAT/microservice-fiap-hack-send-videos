export type UploadFileProviderProps = {
  file: Express.Multer.File;
  fileName: string;
};
export abstract class UploadFileProvider {
  abstract upload(data: UploadFileProviderProps): Promise<void>;
  abstract resumeUpload(
    fileName: string,
    uploadId: string,
    parts: { ETag: string; PartNumber: number }[],
  ): Promise<void>;
}
