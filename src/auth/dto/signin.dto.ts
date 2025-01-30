import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '@src/shared/decorator/trim.decorator';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'example@gmail.com',
    required: true,
  })
  email: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '123456',
    required: true,
  })
  password: string;
}

class User {
  @ApiProperty({
    example: 1,
    required: true,
  })
  id: number;
  @ApiProperty({
    example: 'example@gmail.com',
    required: true,
  })
  email: string;
  @ApiProperty({
    example: '2030-01-01T14:52:45.626Z',
  })
  created_at: Date;
}

export class SignInDtoResponse {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    required: true,
  })
  access_token: string;
  @ApiProperty({
    type: User,
  })
  user: User;
}
