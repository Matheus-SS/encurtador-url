import { Module } from '@nestjs/common';
import { ShortUrlService } from './application/short-urls.service';
import { ShortUrlController } from './presentation/short-urls.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortUrlEntity } from './domain/entities/short-urls.entity';
import { SHORT_URLS_REPOSITORY } from '@src/shared/constants';
import { ShortUrlsRepository } from './infra/short-urls.respository';
import { UsersModule } from '@src/modules/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([ShortUrlEntity]), UsersModule],
  providers: [
    ShortUrlService,
    {
      provide: SHORT_URLS_REPOSITORY,
      useClass: ShortUrlsRepository,
    },
  ],
  exports: [
    ShortUrlService,
    {
      provide: SHORT_URLS_REPOSITORY,
      useClass: ShortUrlsRepository,
    },
  ],
  controllers: [ShortUrlController],
})
export class ShortUrlsModule {}
