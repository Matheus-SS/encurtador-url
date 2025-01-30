import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ShortUrlService } from './short-urls.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { OptionalJwtAuthGuard } from '@src/shared/guard/optional-jwt-auth.guard';
import { UserId } from '@src/shared/decorator/user-id.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('short-url')
export class ShortUrlController {
  constructor(private readonly shortUrlService: ShortUrlService) {}

  @ApiOperation({
    summary: 'Route that creates a short url',
  })
  @ApiCreatedResponse({
    description: 'Request successfully',
    example: {
      url: 'http://localhost:3000/api/v1/short-url/r/bSKSaH',
    },
  })
  @ApiBadRequestResponse({
    description: 'Input validation',
    example: {
      message: ['url must be a URL address', 'url must be a string'],
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  @ApiNotFoundResponse({
    description: 'User id from token not found',
    example: {
      message: 'User not found',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  async create(
    @Body() createShortUrlDto: CreateShortUrlDto,
    @UserId() user_id?: number,
  ) {
    return await this.shortUrlService.create(createShortUrlDto, user_id);
  }
}
