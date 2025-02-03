export interface IRedisRepository {
  setData(key: string, value: string, ttl: number): Promise<void>;
  getData(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}
