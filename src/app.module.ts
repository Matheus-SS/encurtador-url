import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configuration, DatabaseConfig } from './shared/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '@src/modules/users/domain/entities/user.entity';
import { UsersModule } from '@src/modules/users/users.module';
import { AuthModule } from '@src/modules/auth/auth.module';
import { ShortUrlsModule } from '@src/modules/short-urls/short-urls.module';
import { ShortUrlEntity } from '@src/modules/short-urls/domain/entities/short-urls.entity';
import {
  makeCounterProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { CustomMetricsMiddleware } from './shared/middlewares/custom-metrics.middleware';
import { AppController } from './app.controller';
import { HealthModule } from './health.module';
import { RedisModule } from './shared/database/redis/redis.module';
@Module({
  imports: [
    RedisModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: ['.env.development'],
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<DatabaseConfig>(
          'database',
        ) as DatabaseConfig;
        return {
          type: dbConfig.client as 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.user,
          password: dbConfig.password,
          database: dbConfig.name,
          entities: [UsersEntity, ShortUrlEntity],
          synchronize: false,
          autoLoadEntities: true,
          logging: true,
        };
      },
    }),
    PrometheusModule.register({
      path: 'metrics',
    }),
    UsersModule,
    AuthModule,
    ShortUrlsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    makeCounterProvider({
      name: 'count',
      help: 'metric_help',
      labelNames: ['method', 'origin'],
    }),
    makeCounterProvider({
      name: 'gauge',
      help: 'metric_help',
    }),
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CustomMetricsMiddleware).exclude('/metrics').forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
