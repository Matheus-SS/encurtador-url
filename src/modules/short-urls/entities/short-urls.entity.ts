import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
} from 'typeorm';
import { getCurrentDate } from '@src/shared/utils';

@Entity('short_urls')
export class ShortUrlEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  original_url: string;

  @Column({ unique: true, length: 6 })
  short_code: string;

  @Column({ nullable: true })
  user_id?: number;

  @Column({ default: 0, name: 'click_count' })
  click_count: number;

  @Column()
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
  })
  updated_at?: Date;

  @DeleteDateColumn({
    nullable: true,
    name: 'deleted_at',
  })
  deleted_at?: Date;

  @BeforeInsert()
  insertCreated() {
    this.created_at = getCurrentDate() as unknown as Date;
  }
}
