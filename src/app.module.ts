import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configuration, DatabaseConfig } from './shared/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '@src/modules/users/entities/user.entity';
import { UsersModule } from '@src/modules/users/users.module';
import { AuthModule } from '@src/modules/auth/auth.module';
import { ShortUrlsModule } from '@src/modules/short-urls/short-urls.module';
import { ShortUrlEntity } from '@src/modules/short-urls/entities/short-urls.entity';
@Module({
  imports: [
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
    UsersModule,
    AuthModule,
    ShortUrlsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
