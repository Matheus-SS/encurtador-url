import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { ConfigService } from '@nestjs/config';
import { SHORT_URLS_REPOSITORY, USERS_REPOSITORY } from '@src/shared/constants';
import { IShortUrlsRepository } from './short-urls.repository.interface';
import { IUsersRepository } from '@src/modules/users/users.repository.interface';

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
    return `${this.configService.get('app.apiUrl')}/api/v1/short-url/r/${short_code}`;
  }
}
