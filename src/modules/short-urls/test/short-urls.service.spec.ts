import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import {
  REDIS_REPOSITORY,
  SHORT_URLS_REPOSITORY,
  USERS_REPOSITORY,
} from '@src/shared/constants';
import { ShortUrlService } from '@src/modules/short-urls/short-urls.service';

const mockShortUrlsRepository = {
  findByShortCode: jest.fn(),
  create: jest.fn(),
  findByUserId: jest.fn(),
  incrementClickCount: jest.fn(),
  update: jest.fn(),
  softDeleteByUserId: jest.fn(),
};

const mockUsersRepository = {
  findById: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const mockRedisRepository = {
  getData: jest.fn(),
  setData: jest.fn(),
  delete: jest.fn(),
};

describe('ShortUrlService', () => {
  let shortUrlService: ShortUrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortUrlService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: SHORT_URLS_REPOSITORY, useValue: mockShortUrlsRepository },
        { provide: USERS_REPOSITORY, useValue: mockUsersRepository },
        { provide: REDIS_REPOSITORY, useValue: mockRedisRepository },
      ],
    }).compile();

    shortUrlService = module.get<ShortUrlService>(ShortUrlService);

    jest.resetAllMocks();
  });

  it('should create a short URL successfully without user ID', async () => {
    mockShortUrlsRepository.findByShortCode.mockResolvedValueOnce(null);
    mockShortUrlsRepository.create.mockResolvedValueOnce(undefined);
    const result = await shortUrlService.create({ url: 'https://example.com' });

    expect(result).toHaveProperty('url');
    expect(mockShortUrlsRepository.create).toHaveBeenCalled();
    expect(mockShortUrlsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: undefined,
        original_url: 'https://example.com',
      }),
    );
  });

  it('should throw NotFoundException if user is not found', async () => {
    mockUsersRepository.findById.mockResolvedValueOnce(null);

    await expect(
      shortUrlService.create({ url: 'https://example.com' }, 1),
    ).rejects.toThrow(NotFoundException);
  });

  it('should create a short URL with a user ID', async () => {
    mockUsersRepository.findById.mockResolvedValueOnce({ id: 1 });
    mockShortUrlsRepository.findByShortCode.mockResolvedValue(null);
    mockShortUrlsRepository.create.mockResolvedValue(undefined);

    const result = await shortUrlService.create(
      { url: 'https://example.com' },
      1,
    );

    expect(result).toHaveProperty('url');
    expect(mockUsersRepository.findById).toHaveBeenCalledWith(1);
    expect(mockShortUrlsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 1,
        original_url: 'https://example.com',
      }),
    );
  });

  it('should generate a unique short code if a conflict occurs', async () => {
    let callCount = 0;
    /* eslint-disable-next-line @typescript-eslint/require-await */
    mockShortUrlsRepository.findByShortCode.mockImplementationOnce(async () => {
      if (callCount++ === 0) return { short_code: 'existingCode' };
      return null;
    });
    mockShortUrlsRepository.create.mockResolvedValue(undefined);

    const result = await shortUrlService.create({ url: 'https://example.com' });

    expect(result).toHaveProperty('url');
    expect(mockShortUrlsRepository.create).toHaveBeenCalled();
    expect(callCount).toBe(1);
  });

  it('should return user short URLs', async () => {
    mockUsersRepository.findById.mockResolvedValueOnce({ id: 1 });
    mockShortUrlsRepository.findByUserId.mockResolvedValueOnce([
      { id: 1, short_code: 'abc123', original_url: 'https://example.com' },
    ]);

    mockConfigService.get.mockReturnValueOnce('https://mshort.ly');

    const result = await shortUrlService.getUserShortUrls(1);

    expect(result).toEqual([
      {
        id: 1,
        short_code: 'abc123',
        original_url: 'https://example.com',
        short_url_link: 'https://mshort.ly/short-url/r/abc123',
      },
    ]);
    expect(mockUsersRepository.findById).toHaveBeenCalledWith(1);
    expect(mockShortUrlsRepository.findByUserId).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if user is not found when fetching URLs', async () => {
    mockUsersRepository.findById.mockResolvedValueOnce(null);

    await expect(shortUrlService.getUserShortUrls(1)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return the original URL from cache', async () => {
    const short_code = 'abc123';
    const cachedData = JSON.stringify({ original_url: 'https://example.com' });
    mockRedisRepository.getData.mockResolvedValueOnce(cachedData);

    const result = await shortUrlService.getOriginalUrl(short_code);

    expect(result).toEqual({ url: 'https://example.com' });
    expect(mockRedisRepository.getData).toHaveBeenCalledWith(short_code);
    expect(mockShortUrlsRepository.findByShortCode).not.toHaveBeenCalled();
    expect(mockShortUrlsRepository.incrementClickCount).toHaveBeenCalledWith(
      short_code,
    );
  });

  it('should return the original URL from database if not cached', async () => {
    const short_code = 'abc123';
    const dbData = { original_url: 'https://example.com' };
    mockRedisRepository.getData.mockResolvedValue(null);
    mockShortUrlsRepository.findByShortCode.mockResolvedValue(dbData);

    const result = await shortUrlService.getOriginalUrl(short_code);

    expect(result).toEqual({ url: 'https://example.com' });
    expect(mockRedisRepository.getData).toHaveBeenCalledWith(short_code);
    expect(mockShortUrlsRepository.findByShortCode).toHaveBeenCalledWith(
      short_code,
    );
    expect(mockRedisRepository.setData).toHaveBeenCalledWith(
      short_code,
      JSON.stringify(dbData),
      60,
    );
    expect(mockShortUrlsRepository.incrementClickCount).toHaveBeenCalledWith(
      short_code,
    );
  });

  it('should throw NotFoundException if the URL is not found', async () => {
    const short_code = 'abc123';
    mockRedisRepository.getData.mockResolvedValue(null);
    mockShortUrlsRepository.findByShortCode.mockResolvedValue(null);

    await expect(shortUrlService.getOriginalUrl(short_code)).rejects.toThrow(
      NotFoundException,
    );

    expect(mockRedisRepository.getData).toHaveBeenCalledWith(short_code);
    expect(mockShortUrlsRepository.findByShortCode).toHaveBeenCalledWith(
      short_code,
    );
    expect(mockShortUrlsRepository.incrementClickCount).not.toHaveBeenCalled();
  });

  it('should update a short URL successfully', async () => {
    mockUsersRepository.findById.mockResolvedValueOnce({ id: 1 });
    mockShortUrlsRepository.findByShortCode.mockResolvedValueOnce({
      id: 1,
      short_code: 'abc123',
      original_url: 'https://example.com',
    });
    mockShortUrlsRepository.update.mockResolvedValueOnce(undefined);

    await shortUrlService.updateShortUrl(1, 'abc123', {
      original_url: 'https://new-url.com',
    });

    expect(mockUsersRepository.findById).toHaveBeenCalledWith(1);
    expect(mockShortUrlsRepository.findByShortCode).toHaveBeenCalledWith(
      'abc123',
      { user_id: 1 },
    );
    expect(mockShortUrlsRepository.update).toHaveBeenCalledWith(1, {
      original_url: 'https://new-url.com',
    });
    expect(mockRedisRepository.delete).toHaveBeenCalledWith('abc123');
  });

  it('should throw NotFoundException if user is not found when updating a short URL', async () => {
    mockUsersRepository.findById.mockResolvedValueOnce(null);

    await expect(
      shortUrlService.updateShortUrl(1, 'abc123', {
        original_url: 'https://new-url.com',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if short URL is not found for the user', async () => {
    mockUsersRepository.findById.mockResolvedValue({ id: 1 });
    mockShortUrlsRepository.findByShortCode.mockResolvedValue(null);

    await expect(
      shortUrlService.updateShortUrl(1, 'abc123', {
        original_url: 'https://new-url.com',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should delete a short URL successfully', async () => {
    mockUsersRepository.findById.mockResolvedValueOnce({ id: 1 });
    mockShortUrlsRepository.findByShortCode.mockResolvedValueOnce({
      short_code: 'abc123',
    });
    mockShortUrlsRepository.softDeleteByUserId.mockResolvedValueOnce(undefined);

    await shortUrlService.deleteShortUrl(1, 'abc123');

    expect(mockUsersRepository.findById).toHaveBeenCalledWith(1);
    expect(mockShortUrlsRepository.findByShortCode).toHaveBeenCalledWith(
      'abc123',
      { user_id: 1 },
    );
    expect(mockRedisRepository.delete).toHaveBeenCalledWith('abc123');
    expect(mockShortUrlsRepository.softDeleteByUserId).toHaveBeenCalledWith(1, {
      short_code: 'abc123',
    });
  });

  it('should throw NotFoundException if user is not found when deleting a short URL', async () => {
    mockUsersRepository.findById.mockResolvedValueOnce(null);

    await expect(shortUrlService.deleteShortUrl(1, 'abc123')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException if short URL is not found for the user when deleting', async () => {
    mockUsersRepository.findById.mockResolvedValueOnce({ id: 1 });
    mockShortUrlsRepository.findByShortCode.mockResolvedValueOnce(null);

    await expect(shortUrlService.deleteShortUrl(1, 'abc123')).rejects.toThrow(
      NotFoundException,
    );
  });
});
