import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Res,
  Patch,
  Delete,
} from '@nestjs/common';
import { ShortUrlService } from './short-urls.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { OptionalJwtAuthGuard } from '@src/shared/guard/optional-jwt-auth.guard';
import { UserId } from '@src/shared/decorator/user-id.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { GetUserShortUrlsResponse } from './dto/get-url-short-url.dto';
import { Response } from 'express';
import { UpdateShortUrlDto } from './dto/update-short-url.dto';
import { GetUserId } from '@src/shared/decorator/get-user-id.decorator';
@Controller('short-url')
export class ShortUrlController {
  constructor(private readonly shortUrlService: ShortUrlService) {}

  @ApiOperation({
    summary: 'Route that creates a short url',
  })
  @ApiCreatedResponse({
    description: 'Request successfully',
    example: {
      url: 'http://localhost:8000/short-url/r/bSKSaH',
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
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  async create(
    @Body() createShortUrlDto: CreateShortUrlDto,
    @UserId() user_id?: number,
  ) {
    return await this.shortUrlService.create(createShortUrlDto, user_id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Route that return all url from a logged in user',
  })
  @ApiOkResponse({
    description: 'Request successfully',
    type: [GetUserShortUrlsResponse],
  })
  @ApiNotFoundResponse({
    description: 'User id from token not found',
    example: {
      message: 'User not found',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  @ApiBearerAuth()
  @Get('/my-urls')
  async getUserShortUrls(@GetUserId() user_id: number) {
    return await this.shortUrlService.getUserShortUrls(user_id);
  }

  @HttpCode(HttpStatus.FOUND)
  @ApiOperation({
    summary: 'Route that redirects to the original url',
  })
  @ApiNotFoundResponse({
    description: 'Short url not found',
    example: {
      message: 'Short url not found',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  @Get('r/:short_code')
  async getOriginalUrl(
    @Param('short_code') short_code: string,
    @Res() res: Response,
  ) {
    const result = await this.shortUrlService.getOriginalUrl(short_code);

    return res.redirect(result.url);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Route that updates the original url',
  })
  @ApiOkResponse({
    description: 'Request successfully',
    example: 'Short url updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'Not found responses',
    examples: {
      userNotFound: {
        summary: 'User id from token not found',
        value: {
          message: 'User not found',
          error: 'Not Found',
          statusCode: 404,
        },
      },
      shortUrlNotFound: {
        summary: 'Not found url with given short code',
        value: {
          message: 'Short url not found',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    },
  })
  @ApiBearerAuth()
  @Patch(':short_code')
  async updateShortUrl(
    @GetUserId() user_id: number,
    @Param('short_code') short_code: string,
    @Body() updateShortUrlDto: UpdateShortUrlDto,
  ) {
    await this.shortUrlService.updateShortUrl(
      user_id,
      short_code,
      updateShortUrlDto,
    );
    return 'Short url updated successfully';
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Route that updates the field deleted_at in the table short_urls',
  })
  @ApiOkResponse({
    description: 'Request successfully',
    example: 'Short url deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Not found responses',
    examples: {
      userNotFound: {
        summary: 'User id from token not found',
        value: {
          message: 'User not found',
          error: 'Not Found',
          statusCode: 404,
        },
      },
      shortUrlNotFound: {
        summary: 'Not found url with given short code',
        value: {
          message: 'Short url not found',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    },
  })
  @ApiBearerAuth()
  @Delete(':short_code')
  async removeShortUrl(
    @GetUserId() user_id: number,
    @Param('short_code') short_code: string,
  ) {
    await this.shortUrlService.deleteShortUrl(user_id, short_code);
    return 'Short url deleted successfully';
  }
}
