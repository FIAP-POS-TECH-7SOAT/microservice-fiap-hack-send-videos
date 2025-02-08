import { z } from 'zod';

export const schemaEnv = z.object({
  ENV: z.enum(['dev', 'test', 'prod']).default('dev'),
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().optional().default(3000),
  AWS_S3_BUCKET_NAME: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  AMQP_QUEUES: z.object({
    UPLOAD_QUEUE: z.object({
      name: z.string(),
      routing_keys: z.array(z.string()),
    }),
  }),
  AMQP_URL: z.string(),
  REDIS_URL: z.string(),
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_SESSION_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof schemaEnv>;
