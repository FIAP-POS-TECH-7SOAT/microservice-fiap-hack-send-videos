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
import { LoggerProvider } from '@core/common/ports/logger.provider';

@Injectable()
export class S3UploadFileProvider implements UploadFileProvider {
  private client: S3Client;
  private PART_SIZE = 5 * 1024 * 1024; // 5MB
  private BUCKET_NAME: string;
  constructor(
    private readonly env: EnvService,
    private readonly redisService: CacheProvider,
    private readonly loggerProvider: LoggerProvider,
  ) {
    this.client = new S3Client({
      region: 'us-east-1',
    });
    this.BUCKET_NAME = this.env.get('AWS_S3_BUCKET_NAME');
  }

  private async isComplete({
    fileName,
    part,
    parts,
    total,
    uploadId,
  }: isComplete) {
    if (total === part) {
      await this.client.send(
        new CompleteMultipartUploadCommand({
          Bucket: this.BUCKET_NAME,
          Key: fileName,
          UploadId: uploadId,
          MultipartUpload: { Parts: parts },
        }),
      );

      this.loggerProvider.info('Todas as partes do upload foram enviadas');

      return true;
    }
    return false;
  }
  async uploadPart({
    file,
    fileName,
    partNumber,
    uploadId,
    totalParts,
  }: UploadPartFileProviderProps): Promise<UploadPartFileProviderResponse> {
    const redisKey = `upload:${fileName}`;
    const maxRetries = 3;
    let isComplete = false;

    try {
      // Recuperar estado do Redis se o `uploadId` não for fornecido

      const state = await this.redisService.get<{
        uploadId: string;
        parts: PartsUploadFile[];
      }>(redisKey);
      if (state) {
        const last_upload = state.parts[state.parts.length - 1];

        if (partNumber <= last_upload.PartNumber) {
          this.loggerProvider.info(
            `Parte ${partNumber} já tinha sido enviada com sucesso. Pulando para a de numero ${last_upload.PartNumber + 1}`,
          );

          isComplete = await this.isComplete({
            fileName,
            part: partNumber,
            parts: state.parts,
            total: totalParts,
            uploadId: state.uploadId,
          });
          return {
            id: state.uploadId,
            next_part: Number(last_upload.PartNumber) + 1,
            finished: isComplete,
          };
        }
      }

      if (!uploadId) {
        // tenta pegar do redis
        uploadId = state?.uploadId;

        // se nao tiver nem no redis, cria um novo
        if (!uploadId) {
          // Criar um novo Multipart Upload
          const createResponse = await this.client.send(
            new CreateMultipartUploadCommand({
              Bucket: this.BUCKET_NAME,
              Key: fileName,
              ACL: 'private',
            }),
          );
          uploadId = createResponse.UploadId!;

          // Inicializar o estado no Redis
          await this.redisService.set(redisKey, { uploadId, parts: [] });
        }
      }

      // Enviar a parte
      let attempt = 0;
      let uploadPartResponse;

      while (attempt < maxRetries) {
        try {
          uploadPartResponse = await this.client.send(
            new UploadPartCommand({
              Bucket: this.BUCKET_NAME,
              Key: fileName,
              UploadId: uploadId,
              PartNumber: partNumber,
              Body: file.buffer,
            }),
          );

          // Atualizar estado no Redis
          const currentState = await this.redisService.get<{
            uploadId: string;
            parts: PartsUploadFile[];
          }>(redisKey);

          const updatedParts = [
            ...(currentState?.parts || []),
            {
              ETag: uploadPartResponse.ETag!,
              PartNumber: partNumber,
            },
          ];

          await this.redisService.set(redisKey, {
            uploadId,
            parts: updatedParts,
          });

          this.loggerProvider.info(`Parte ${partNumber} enviada com sucesso.`);

          isComplete = await this.isComplete({
            fileName,
            part: partNumber,
            parts: updatedParts,
            total: totalParts,
            uploadId: uploadId,
          });
          break;
        } catch (error) {
          attempt++;
          this.loggerProvider.error(
            `Erro ao enviar parte ${partNumber}. Tentativa ${attempt}/${maxRetries}`,
          );

          if (attempt >= maxRetries) {
            throw error;
          }
        }
      }

      return { id: uploadId, next_part: partNumber + 1, finished: isComplete };
    } catch (error) {
      this.loggerProvider.error(
        `Erro no upload da parte ${partNumber}: ${error.message}`,
      );

      throw error;
    }
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
          this.loggerProvider.info(
            `Parte ${partNumber} já enviada. Pulando...`,
          );

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
              this.loggerProvider.error('Simulando falha na parte 3...');
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
            this.loggerProvider.info(
              `Parte ${partNumber}/${totalParts} enviada com sucesso.`,
            );

            break;
          } catch (error) {
            attempt++;
            this.loggerProvider.error(
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

      this.loggerProvider.info(`Upload completo: ${fileName}`);

      // Remover estado do Redis
      await this.redisService.delete(redisKey);
    } catch (error) {
      this.loggerProvider.error(`Erro no upload: ${error.message}`);
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
        this.loggerProvider.info(`Parte ${partNumber} já enviada. Pulando...`);
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
          this.loggerProvider.info(
            `Parte ${partNumber}/${totalParts} enviada com sucesso.`,
          );
          break;
        } catch (error) {
          attempt++;
          this.loggerProvider.error(
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

    this.loggerProvider.info(`Upload completado com sucesso: ${fileName}`);
    await this.redisService.delete(`upload:${fileName}`);
  }
}
