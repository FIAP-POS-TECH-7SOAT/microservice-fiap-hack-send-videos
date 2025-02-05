import { z } from 'zod';

export const schemaEnv = z.object({
  ENV: z.enum(['dev', 'test', 'prod']).default('dev'),
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().optional().default(3000),
  AWS_S3_BUCKET_NAME: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  AMQP_QUEUES: z.object({
    FILE_QUEUE: z.object({
      name: z.string(),
      routing_keys: z.array(z.string()),
    }),
  }),
  AMQP_URL: z.string(),
  REDIS_URL: z.string(),
});

export type Env = z.infer<typeof schemaEnv>;
