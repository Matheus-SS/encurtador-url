import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '@src/shared/decorator/trim.decorator';
import { IsString, IsUrl } from 'class-validator';

export class CreateShortUrlDto {
  @Trim()
  @IsString()
  @IsUrl({
    require_protocol: true,
    require_valid_protocol: true,
  })
  @ApiProperty({
    example: 'https://youtube.com.br',
    required: true,
  })
  url: string;
}
