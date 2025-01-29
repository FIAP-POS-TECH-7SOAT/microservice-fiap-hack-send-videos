import { CacheProvider } from '@core/modules/video/applications/ports/providers/cache.provider';

export class MockCacheProvider extends CacheProvider {
  private cache: Record<string, string> = {};

  /**
   * Retorna todas as chaves que correspondem a um padrão.
   * Se o padrão for uma string vazia, retorna todas as chaves.
   */
  async listKeys(pattern: string): Promise<string[]> {
    if (!pattern) {
      return Object.keys(this.cache);
    }

    const regex = new RegExp(pattern.replace('*', '.*')); // Suporte para padrões simples
    return Object.keys(this.cache).filter((key) => regex.test(key));
  }

  /**
   * Obtém o valor armazenado em cache para uma chave específica.
   * Retorna null se a chave não existir.
   */

  async get<GProps = any>(key: string): Promise<GProps> {
    const data = this.cache[key];
    return data ? JSON.parse(data) : null;
  }

  /**
   * Armazena um valor no cache com uma chave específica.
   * Opcionalmente, TTL pode ser utilizado para determinar o tempo de vida (não implementado no mock).
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.cache[key] = JSON.stringify(value);

    // TTL não será usado no mock, mas pode ser implementado futuramente.
    if (ttl) {
      console.warn(
        `TTL (${ttl} segundos) foi fornecido, mas não está implementado no MockCacheProvider.`,
      );
    }
  }

  /**
   * Remove um valor do cache com base na chave.
   * Se a chave não existir, a operação será silenciosa.
   */
  async delete(key: string): Promise<void> {
    delete this.cache[key];
  }

  /**
   * Obtém um buffer de arquivo armazenado no cache em formato Base64.
   * Lança um erro se a chave não for encontrada.
   */
  async getFileBufferFromRedis(key: string): Promise<Buffer> {
    const fileBase64 = this.cache[key];
    if (!fileBase64) {
      throw new Error(`Arquivo não encontrado no cache para a chave: ${key}`);
    }
    return Buffer.from(fileBase64, 'base64');
  }
}
