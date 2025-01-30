import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, SignUpDtoResponse } from './dto/signup.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';

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
  @Post('signin')
  async signup(@Body() signup: SignUpDto) {
    return await this.authService.signup(signup);
  }
}
