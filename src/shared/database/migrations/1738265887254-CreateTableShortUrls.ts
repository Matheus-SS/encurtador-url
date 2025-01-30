import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableShortUrls1738265887254 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            create table 
            if not exists short_urls(
                id serial primary key,
                original_url text not null, 
                short_code varchar(6) unique not null,
                user_id int,
                click_count int default 0 not null,
                created_at timestamptz not null,
                updated_at timestamptz,
                deleted_at timestamptz
            );

            create index idx_user_id on
            short_urls (user_id);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE short_urls`);
  }
}
