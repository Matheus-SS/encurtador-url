import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './domain/entities/user.entity';
import { UsersRepository } from './infra/users.repository';
import { USERS_REPOSITORY } from '@src/shared/constants';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity])],
  providers: [
    {
      provide: USERS_REPOSITORY,
      useClass: UsersRepository,
    },
  ],
  exports: [
    {
      provide: USERS_REPOSITORY,
      useClass: UsersRepository,
    },
  ],
})
export class UsersModule {}
