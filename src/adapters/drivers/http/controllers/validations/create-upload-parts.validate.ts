import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createUploadPartSchema = z.object({
  part_number: z.number(),
  total_parts: z.number(),
  upload_id: z.string(),
  file_name: z.string(),
});

export class CreateUploadPartProps extends createZodDto(
  createUploadPartSchema,
) {}
