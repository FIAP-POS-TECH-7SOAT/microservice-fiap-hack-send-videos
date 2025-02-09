import { CacheProvider } from '@core/modules/video/applications/ports/providers/cache.provider';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FakeCacheProvider implements CacheProvider {
  private cache: Record<string, any> = {};

  async get<T>(key: string): Promise<T> {
    return this.cache[key] || null;
  }

  async set(key: string, value: any): Promise<void> {
    this.cache[key] = value;
  }
  async delete(key: string): Promise<void> {}
  async listKeys(pattern: string): Promise<string[]> {
    return [];
  }
}
