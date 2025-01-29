import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './entities/user.entity';
import { UsersRepository } from './users.repository';
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
