import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const generateUploadPartKeySchema = z.object({
  total_parts: z.number(),

  file_name: z.string(),
});

export class GenerateUploadPartKeyProps extends createZodDto(
  generateUploadPartKeySchema,
) {}
