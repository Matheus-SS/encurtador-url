import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ShortUrlService } from './short-urls.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { OptionalJwtAuthGuard } from '@src/shared/guard/optional-jwt-auth.guard';
import { UserId } from '@src/shared/decorator/user-id.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('short-url')
export class ShortUrlController {
  constructor(private readonly shortUrlService: ShortUrlService) {}

  @ApiBearerAuth()
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  async create(
    @Body() createShortUrlDto: CreateShortUrlDto,
    @UserId() user_id?: number,
  ) {
    return await this.shortUrlService.create(createShortUrlDto, user_id);
  }
}
