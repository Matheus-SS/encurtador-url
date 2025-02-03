import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { ConfigService } from '@nestjs/config';
import { SHORT_URLS_REPOSITORY, USERS_REPOSITORY } from '@src/shared/constants';
import { IShortUrlsRepository } from './short-urls.repository.interface';
import { IUsersRepository } from '@src/modules/users/users.repository.interface';
import { GetUserShortUrlsResponse } from './dto/get-url-short-url.dto';
import { UpdateShortUrlDto } from './dto/update-short-url.dto';

@Injectable()
export class ShortUrlService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(SHORT_URLS_REPOSITORY)
    private readonly shortUrlsRepository: IShortUrlsRepository,
    @Inject(USERS_REPOSITORY)
    private readonly userRepository: IUsersRepository,
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
    const shortUrl = await this.shortUrlsRepository.findByShortCode(short_code);

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
