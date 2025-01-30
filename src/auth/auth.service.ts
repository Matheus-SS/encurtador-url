import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { USERS_REPOSITORY } from '@src/shared/constants';
import { IUsersRepository } from '@src/modules/users/users.repository.interface';
import * as bcrypt from 'bcrypt';
import { SignUpDto, SignUpDtoResponse } from './dto/signup.dto';
import { SignInDto, SignInDtoResponse } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private log = new Logger(AuthService.name);
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly userRepository: IUsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signup: SignUpDto): Promise<SignUpDtoResponse> {
    const userFound = await this.userRepository.findByEmail(signup.email);

    if (userFound) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await this.generateHash(signup.password);

    const user = await this.userRepository.create({
      email: signup.email,
      password: hashedPassword,
    });

    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    };
  }

  async signin(signInDto: SignInDto): Promise<SignInDtoResponse> {
    const userFound = await this.userRepository.findByEmail(signInDto.email);

    if (!userFound) {
      this.log.error('incorrect email');
      throw new NotFoundException('Email or password incorrect');
    }

    const passwordMatch = await this.compareHash(
      signInDto.password,
      userFound.password,
    );

    if (!passwordMatch) {
      this.log.error('incorrect password');
      throw new NotFoundException('Email or password incorrect');
    }

    return {
      access_token: this.jwtService.sign({ sub: userFound.id }),
      user: {
        id: userFound.id,
        email: userFound.email,
        created_at: userFound.created_at,
      },
    };
  }

  private async generateHash(plainText: string): Promise<string> {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(plainText, saltRounds);

    return hashed;
  }

  private async compareHash(
    plainText: string,
    valueHashed: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainText, valueHashed);
  }
}
