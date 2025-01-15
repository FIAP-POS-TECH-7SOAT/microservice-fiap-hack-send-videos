import { z } from 'zod';

export const schemaEnv = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().optional().default(3000),
  AWS_S3_BUCKET_NAME: z.string(),
});

export type Env = z.infer<typeof schemaEnv>;
