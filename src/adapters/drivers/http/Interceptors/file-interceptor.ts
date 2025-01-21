import { Injectable } from '@nestjs/common';

import { extname } from 'path';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class FileInterceptorService {
  static multerOptions = {
    storage: multerS3({
      s3: new S3Client(),
      bucket: 'YOUR_S3_BUCKET_NAME',
      acl: 'public-read',
      key: (req, file, cb) => {
        cb(null, Date.now().toString() + extname(file.originalname)); // Nome único no S3
      },
    }),
    limits: { fileSize: 50 * 1024 * 1024 }, // Limite de tamanho de arquivo (50MB no exemplo)
  };
}
