// redis.module.ts
import { Global, Module, DynamicModule } from '@nestjs/common';
import { Redis } from 'ioredis';
import { configuration } from '@src/shared/config';
import { RedisRepository } from './redis.repository';
import { REDIS_REPOSITORY } from '@src/shared/constants';

@Global()
@Module({})
export class RedisModule {
  static forRoot(): DynamicModule {
    const redisProvider = {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const database = configuration().database;
        const client = new Redis({
          host: database.redisHost,
          port: database.redisPort,
        });

        return client;
      },
    };

    return {
      module: RedisModule,
      providers: [
        redisProvider,
        {
          provide: REDIS_REPOSITORY,
          useClass: RedisRepository,
        },
      ],
      exports: [
        {
          provide: REDIS_REPOSITORY,
          useClass: RedisRepository,
        },
      ],
    };
  }
}
