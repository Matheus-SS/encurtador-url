import { ApiProperty } from '@nestjs/swagger';

export class GetUserShortUrlsResponse {
  @ApiProperty({
    example: 1,
  })
  id: number;
  @ApiProperty({
    example: 'https://youtube.com.br',
  })
  original_url: string;

  @ApiProperty({
    example: 'QWERTY1',
  })
  short_code: string;

  @ApiProperty({
    example: 1,
  })
  user_id?: number;

  @ApiProperty({
    example: 9,
  })
  click_count: number;

  @ApiProperty({
    example: '2030-01-01T14:52:45.626Z',
  })
  created_at: Date;

  @ApiProperty({
    example: '2031-01-01T14:52:45.626Z',
    nullable: true,
  })
  updated_at?: Date;

  @ApiProperty({
    example: '2032-01-01T14:52:45.626Z',
    nullable: true,
  })
  deleted_at?: Date;

  @ApiProperty({
    example: 'http://localhost:8000/short-url/r/bSKSaH',
  })
  short_url_link: string;
}
