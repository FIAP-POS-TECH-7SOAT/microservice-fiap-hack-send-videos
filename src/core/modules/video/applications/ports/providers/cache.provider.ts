export abstract class CacheProvider {
  abstract get<GProps = any>(key: string): Promise<GProps>;
  abstract set(key: string, data: any, ttl?: number): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract listKeys(pattern: string): Promise<string[]>;
}
