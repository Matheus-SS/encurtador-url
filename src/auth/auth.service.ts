import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { USERS_REPOSITORY } from '@src/shared/constants';
import { IUsersRepository } from '@src/modules/users/users.repository.interface';
import * as bcrypt from 'bcrypt';
import { SignUpDto, SignUpDtoResponse } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly userRepository: IUsersRepository,
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

  private async generateHash(plainText: string): Promise<string> {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(plainText, saltRounds);

    return hashed;
  }
}
