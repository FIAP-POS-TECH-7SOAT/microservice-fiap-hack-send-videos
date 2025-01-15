import {
  UploadFileProvider,
  UploadFileProviderProps,
} from '@core/modules/video/applications/ports/providers/upload-file';
import { Injectable } from '@nestjs/common';

import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { EnvService } from '../infra/envs/env.service';
import { CacheProvider } from '@core/modules/video/applications/ports/providers/cache.provider';

@Injectable()
export class S3UploadFileProvider implements UploadFileProvider {
  private client: S3Client;
  private PART_SIZE = 5 * 1024 * 1024; // 5MB
  private BUCKET_NAME: string;
  constructor(
    private readonly env: EnvService,
    private readonly redisService: CacheProvider,
  ) {
    this.client = new S3Client({
      region: 'us-east-1',
    });
    this.BUCKET_NAME = this.env.get('AWS_S3_BUCKET_NAME');
  }
  async upload({ file, fileName }: UploadFileProviderProps): Promise<void> {
    const redisKey = `upload:${fileName}`;

    const maxRetries = 3;

    // Recuperar estado do Redis (UploadId e partes enviadas)
    const state = await this.redisService.get<{
      uploadId: string;
      parts: { ETag: string; PartNumber: number }[];
    }>(redisKey);

    let uploadId = state?.uploadId;
    const parts = state?.parts || [];

    try {
      // Iniciar o Multipart Upload se não existir estado
      if (!uploadId) {
        const createResponse = await this.client.send(
          new CreateMultipartUploadCommand({
            Bucket: this.BUCKET_NAME,
            Key: fileName,
            ACL: 'private',
          }),
        );
        uploadId = createResponse.UploadId!;
        await this.redisService.set(redisKey, { uploadId, parts });
      }

      // Enviar partes restantes
      const buffer = file.buffer;
      const totalParts = Math.ceil(buffer.length / this.PART_SIZE);

      // await this.redisService.set(redisBufferKey, buffer.toString('base64'));

      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        // Pular partes já enviadas
        if (parts.find((p) => p.PartNumber === partNumber)) {
          console.log(`Parte ${partNumber} já enviada. Pulando...`);
          continue;
        }

        const start = (partNumber - 1) * this.PART_SIZE;
        const end = Math.min(partNumber * this.PART_SIZE, buffer.length);
        const partBuffer = buffer.slice(start, end);

        let attempt = 0;
        let uploadPartResponse;

        while (attempt < maxRetries) {
          try {
            if (attempt === 0 && partNumber === 3) {
              console.error('Simulando falha na parte 3...');
              throw new Error('Falha simulada na parte 3');
            }
            uploadPartResponse = await this.client.send(
              new UploadPartCommand({
                Bucket: this.BUCKET_NAME,
                Key: fileName,
                UploadId: uploadId,
                PartNumber: partNumber,
                Body: partBuffer,
              }),
            );
            parts.push({
              ETag: uploadPartResponse.ETag!,
              PartNumber: partNumber,
            });

            // Salvar estado no Redis
            await this.redisService.set(redisKey, { uploadId, parts });

            console.log(
              `Parte ${partNumber}/${totalParts} enviada com sucesso.`,
            );
            break;
          } catch (error) {
            attempt++;
            console.error(
              `Erro ao enviar parte ${partNumber}. Tentativa ${attempt}/${maxRetries}`,
            );
            if (attempt >= maxRetries) {
              throw error;
            }
          }
        }
      }

      // Completar o Multipart Upload
      await this.client.send(
        new CompleteMultipartUploadCommand({
          Bucket: this.BUCKET_NAME,
          Key: fileName,
          UploadId: uploadId,
          MultipartUpload: { Parts: parts },
        }),
      );

      console.log(`Upload completo: ${fileName}`);

      // Remover estado do Redis
      await this.redisService.delete(redisKey);
    } catch (error) {
      console.error(`Erro no upload: ${error.message}`);
      throw error;
    }
  }

  async resumeUpload(
    fileName: string,
    uploadId: string,
    parts: { ETag: string; PartNumber: number }[],
  ): Promise<void> {
    const buffer = await this.redisService.get<Buffer>('buffer:' + fileName);
    const totalParts = Math.ceil(buffer.length / this.PART_SIZE);

    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      if (parts.find((p) => p.PartNumber === partNumber)) {
        console.log(`Parte ${partNumber} já enviada. Pulando...`);
        continue;
      }

      const start = (partNumber - 1) * this.PART_SIZE;
      const end = Math.min(partNumber * this.PART_SIZE, buffer.length);
      const partBuffer = buffer.slice(start, end);

      let attempt = 0;
      while (attempt < 3) {
        try {
          const uploadPartResponse = await this.client.send(
            new UploadPartCommand({
              Bucket: this.BUCKET_NAME,
              Key: fileName,
              UploadId: uploadId,
              PartNumber: partNumber,
              Body: partBuffer,
            }),
          );

          parts.push({
            ETag: uploadPartResponse.ETag!,
            PartNumber: partNumber,
          });

          // Atualizar estado no Redis
          await this.redisService.set(`upload:${fileName}`, {
            uploadId,
            parts,
          });
          console.log(`Parte ${partNumber}/${totalParts} enviada com sucesso.`);
          break;
        } catch (error) {
          attempt++;
          console.error(
            `Erro ao enviar parte ${partNumber}. Tentativa ${attempt}`,
          );
          if (attempt >= 3) {
            throw error;
          }
        }
      }
    }

    // Completar o upload
    await this.client.send(
      new CompleteMultipartUploadCommand({
        Bucket: this.BUCKET_NAME,
        Key: fileName,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      }),
    );

    console.log(`Upload completado com sucesso: ${fileName}`);
    await this.redisService.delete(`upload:${fileName}`);
  }
}
