/* eslint-disable @typescript-eslint/no-unused-expressions */
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as Redis from 'ioredis';
import { IRedisRepository } from './redis.repository.interface';
import { configuration } from '@src/shared/config';
import { REDIS_CLIENT } from '@src/shared/constants';

@Injectable()
export class RedisRepository
  implements OnModuleInit, OnModuleDestroy, IRedisRepository
{
  private log = new Logger(RedisRepository.name);
  FLAG_DEBUG_REDIS_REPOSITORY = 0;
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis.Redis) {
    this.FLAG_DEBUG_REDIS_REPOSITORY =
      configuration().app.FLAG_DEBUG_REDIS_REPOSITORY;
  }

  onModuleInit() {
    this.log.log('Connected to Redis');
  }

  async setData(key: string, value: string, ttl: number = 60): Promise<void> {
    this.FLAG_DEBUG_REDIS_REPOSITORY &&
      this.log.debug(
        `SET redis function key: ${key} - value: ${value} - ttl:${ttl}`,
      );
    await this.redisClient.set(key, value, 'EX', ttl);
  }

  async getData(key: string): Promise<string | null> {
    this.FLAG_DEBUG_REDIS_REPOSITORY &&
      this.log.debug(`GET redis function KEY: ${key}`);
    const value = await this.redisClient.get(key);
    this.FLAG_DEBUG_REDIS_REPOSITORY &&
      this.log.debug(`GET redis function VALUE: ${value}`);
    return value;
  }

  async delete(key: string): Promise<void> {
    this.FLAG_DEBUG_REDIS_REPOSITORY &&
      this.log.debug(`DELETE redis function: ${key}`);
    await this.redisClient.del(key);
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }
}
