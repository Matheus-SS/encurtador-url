import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '@src/shared/decorator/trim.decorator';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'example@gmail.com',
    required: true,
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({
    example: '123456',
    required: true,
  })
  password: string;
}

export class SignUpDtoResponse {
  @ApiProperty({
    example: 1,
  })
  id: number;
  @ApiProperty({
    example: 'example@gmail.com',
  })
  email: string;

  @ApiProperty({
    example: '2030-01-01T14:52:45.626Z',
  })
  created_at: Date;
}
