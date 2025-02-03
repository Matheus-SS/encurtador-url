import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class UpdateShortUrlDto {
  @IsUrl(
    {
      require_protocol: true,
      require_valid_protocol: true,
    },
    {
      message:
        'url must be a valid url, verify if there is http:// or https:// on url',
    },
  )
  @ApiProperty({
    example: 'https://google.com.br',
    required: true,
  })
  original_url: string;
}
