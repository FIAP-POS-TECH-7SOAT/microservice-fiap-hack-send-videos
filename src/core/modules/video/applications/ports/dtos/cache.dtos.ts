export type PartsUploadFile = { ETag: string; PartNumber: number };
export type GetCacheVideoUploadedResponse = {
  uploadId: string;
  totalParts: number;
  parts: PartsUploadFile[];
};
