export type ShortUrl = {
  id: number;
  original_url: string;
  short_code: string;
  user_id?: number;
  click_count: number;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
};

export type CreateShortUrl = {
  original_url: string;
  short_code: string;
  user_id?: number;
};

export interface IShortUrlsRepository {
  create(data: CreateShortUrl): Promise<ShortUrl>;
  findByShortCode(
    short_code: string,
    options?: { user_id: number },
  ): Promise<ShortUrl | null>;
  findByUserId(user_id: number): Promise<ShortUrl[]>;
  incrementClickCount(short_code: string): Promise<void>;
  update(id: number, options?: { original_url: string }): Promise<void>;
  softDeleteByUserId(
    user_id: number,
    options?: { short_code: string },
  ): Promise<number | undefined>;
}
