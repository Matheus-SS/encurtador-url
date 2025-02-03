import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import {
  CreateShortUrl,
  IShortUrlsRepository,
  ShortUrl,
} from '../domain/short-urls.repository.interface';
import { ShortUrlEntity } from '../domain/entities/short-urls.entity';
import { getCurrentDate } from '@src/shared/utils';

@Injectable()
export class ShortUrlsRepository implements IShortUrlsRepository {
  constructor(
    @InjectRepository(ShortUrlEntity)
    private readonly shortUrlsRepository: Repository<ShortUrlEntity>,
  ) {}

  async create(data: CreateShortUrl): Promise<ShortUrl> {
    const shortUrl = this.shortUrlsRepository.create({
      short_code: data.short_code,
      original_url: data.original_url,
      user_id: data.user_id,
    });
    const savedShortUrl = await this.shortUrlsRepository.save(shortUrl);
    return savedShortUrl;
  }

  async findByShortCode(
    short_code: string,
    options?: { user_id: number },
  ): Promise<ShortUrl | null> {
    let condition: { short_code: string; user_id?: number } = {
      short_code: short_code,
    };

    if (options?.user_id !== undefined) {
      condition = {
        user_id: options.user_id,
        short_code: short_code,
      };
    }

    const short_url = await this.shortUrlsRepository.findOne({
      where: condition,
    });

    return short_url;
  }

  async findByUserId(user_id: number): Promise<ShortUrl[]> {
    const short_url = await this.shortUrlsRepository.find({
      where: {
        user_id: user_id,
      },
    });

    return short_url;
  }

  async incrementClickCount(short_code: string): Promise<void> {
    await this.shortUrlsRepository.query(
      `
      UPDATE short_urls SET click_count = click_count + 1, updated_at = $1 WHERE short_code = $2  
    `,
      [getCurrentDate(), short_code],
    );
  }

  async update(id: number, options?: { original_url: string }): Promise<void> {
    await this.shortUrlsRepository.update(
      { id: id },
      { original_url: options?.original_url },
    );
  }

  async softDeleteByUserId(
    user_id: number,
    options?: { short_code: string },
  ): Promise<number | undefined> {
    let query: { user_id: number; short_code?: string } = { user_id: user_id };

    if (options?.short_code !== undefined) {
      query = {
        short_code: options.short_code,
        user_id: user_id,
      };
    }
    const { affected } = await this.shortUrlsRepository.softDelete(query);

    return affected;
  }
}
