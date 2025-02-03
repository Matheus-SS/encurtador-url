import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateShortUrlDto } from '../application/dto/create-short-url.dto';
import { ConfigService } from '@nestjs/config';
import {
  REDIS_REPOSITORY,
  SHORT_URLS_REPOSITORY,
  USERS_REPOSITORY,
} from '@src/shared/constants';
import {
  IShortUrlsRepository,
  ShortUrl,
} from '../domain/short-urls.repository.interface';
import { IUsersRepository } from '@src/modules/users/domain/users.repository.interface';
import { GetUserShortUrlsResponse } from '../application/dto/get-url-short-url.dto';
import { UpdateShortUrlDto } from '../application/dto/update-short-url.dto';
import { RedisRepository } from '@src/shared/database/redis/redis.repository';

@Injectable()
export class ShortUrlService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(SHORT_URLS_REPOSITORY)
    private readonly shortUrlsRepository: IShortUrlsRepository,
    @Inject(USERS_REPOSITORY)
    private readonly userRepository: IUsersRepository,
    @Inject(REDIS_REPOSITORY)
    private readonly redisRepository: RedisRepository,
  ) {}

  async create(createShortUrlDto: CreateShortUrlDto, user_id?: number) {
    let shortCode: string;

    if (user_id) {
      const user = await this.userRepository.findById(user_id);

      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    do {
      shortCode = this.generateShortCode();
    } while (await this.shortUrlsRepository.findByShortCode(shortCode));

    await this.shortUrlsRepository.create({
      original_url: createShortUrlDto.url,
      short_code: shortCode,
      user_id: user_id,
    });

    return {
      url: this.generateShortUrlLink(shortCode),
    };
  }

  async getUserShortUrls(user_id: number): Promise<GetUserShortUrlsResponse[]> {
    const user = await this.userRepository.findById(user_id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const urls = await this.shortUrlsRepository.findByUserId(user_id);

    return urls.map((url) => ({
      ...url,
      short_url_link: this.generateShortUrlLink(url.short_code),
    }));
  }

  async getOriginalUrl(short_code: string): Promise<{ url: string }> {
    let shortUrl: ShortUrl | null;
    const shortUrlCache = await this.redisRepository.getData(short_code);

    if (shortUrlCache) {
      shortUrl = JSON.parse(shortUrlCache);
    } else {
      shortUrl = await this.shortUrlsRepository.findByShortCode(short_code);

      if (shortUrl) {
        await this.redisRepository.setData(
          short_code,
          JSON.stringify(shortUrl),
          60,
        );
      }
    }

    if (!shortUrl) {
      throw new NotFoundException('Short url not found');
    }

    await this.shortUrlsRepository.incrementClickCount(short_code);
    return {
      url: shortUrl.original_url,
    };
  }

  async updateShortUrl(
    user_id: number,
    short_code: string,
    { original_url }: UpdateShortUrlDto,
  ): Promise<void> {
    const user = await this.userRepository.findById(user_id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const short_url = await this.shortUrlsRepository.findByShortCode(
      short_code,
      {
        user_id: user_id,
      },
    );

    if (!short_url) {
      throw new NotFoundException('Short url not found');
    }

    await this.redisRepository.delete(short_code);
    await this.shortUrlsRepository.update(short_url.id, {
      original_url: original_url,
    });
  }

  async deleteShortUrl(user_id: number, short_code: string): Promise<void> {
    const user = await this.userRepository.findById(user_id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const short_url = await this.shortUrlsRepository.findByShortCode(
      short_code,
      {
        user_id: user_id,
      },
    );

    if (!short_url) {
      throw new NotFoundException('Short url not found');
    }

    await this.redisRepository.delete(short_code);

    await this.shortUrlsRepository.softDeleteByUserId(user_id, {
      short_code: short_code,
    });
  }

  private generateShortCode(): string {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateShortUrlLink(short_code: string): string {
    return `${this.configService.get('app.apiUrl')}/short-url/r/${short_code}`;
  }
}
