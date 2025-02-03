import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { SignUpDto, SignUpDtoResponse } from '../application/dto/signup.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SignInDto, SignInDtoResponse } from '../application/dto/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Route that creates a user',
  })
  @ApiCreatedResponse({
    description: 'Request successfully',
    type: SignUpDtoResponse,
  })
  @ApiBadRequestResponse({
    description: 'Input validation',
    example: {
      message: [
        'email must be an email',
        'email should not be empty',
        'email must be a string',
        'password must be longer than or equal to 6 characters',
        'password should not be empty',
        'password must be a string',
      ],
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  @ApiConflictResponse({
    description: 'Email already in the database',
    example: {
      message: 'User already exists',
      error: 'Conflict',
      statusCode: 409,
    },
  })
  @Post('signup')
  async signup(@Body() signup: SignUpDto) {
    return await this.authService.signup(signup);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Route that signin a user',
  })
  @ApiBadRequestResponse({
    description: 'Input validation',
    example: {
      message: [
        'email must be an email',
        'email should not be empty',
        'email must be a string',
        'password should not be empty',
        'password must be a string',
      ],
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  @ApiOkResponse({
    description: 'Request successfully',
    type: SignInDtoResponse,
  })
  @ApiNotFoundResponse({
    description: 'Email or password incorrect',
    example: {
      message: 'Email or password incorrect',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  @Post('signin')
  async signin(@Body() signin: SignInDto) {
    return await this.authService.signin(signin);
  }
}
