import { Module } from '@nestjs/common';
import { ShortUrlService } from './short-urls.service';
import { ShortUrlController } from './short-urls.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortUrlEntity } from './entities/short-urls.entity';
import { SHORT_URLS_REPOSITORY } from '@src/shared/constants';
import { ShortUrlsRepository } from './short-urls.respository';
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
