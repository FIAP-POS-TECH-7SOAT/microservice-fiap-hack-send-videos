import { CacheProvider } from '@core/modules/video/applications/ports/providers/cache.provider';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { EnvService } from '../infra/envs/env.service';

@Injectable()
export class RedisCacheProvider implements CacheProvider {
  private readonly redis: Redis;

  constructor(private readonly env: EnvService) {
    this.redis = new Redis(this.env.get('REDIS_URL'));
  }
  async listKeys(pattern: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const keys: string[] = [];
      const stream = this.redis.scanStream({ match: pattern });

      stream.on('data', (resultKeys) => {
        keys.push(...resultKeys);
      });
      stream.on('end', () => resolve(keys));
      stream.on('error', (err) => reject(err));
    });
  }
  async get<GProps = any>(key: string): Promise<GProps> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttl) {
      await this.redis.set(key, data, 'EX', ttl);
    } else {
      await this.redis.set(key, data);
    }
  }
  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async getFileBufferFromRedis(key: string): Promise<Buffer> {
    const fileBase64 = await this.redis.get(key);
    if (!fileBase64) {
      throw new Error('Arquivo não encontrado no Redis');
    }
    return Buffer.from(fileBase64, 'base64');
  }
}
