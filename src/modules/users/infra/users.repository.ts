import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateUser,
  IUsersRepository,
  User,
} from '../domain/users.repository.interface';
import { UsersEntity } from '../domain/entities/user.entity';
import { Repository } from 'typeorm';

export class UsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  async create(data: CreateUser): Promise<User> {
    const user = this.usersRepository.create(data);
    const savedUser = await this.usersRepository.save(user);
    return savedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: {
        email: email,
      },
    });

    return user;
  }

  async findById(user_id: number): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: {
        id: user_id,
      },
    });

    return user;
  }
}
