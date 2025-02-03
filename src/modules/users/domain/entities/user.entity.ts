import { getCurrentDate } from '@src/shared/utils';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';

@Entity('users')
export class UsersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
  })
  updated_at: Date;

  @BeforeInsert()
  insertCreated() {
    this.created_at = getCurrentDate() as unknown as Date;
  }
}
