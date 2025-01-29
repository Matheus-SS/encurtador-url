import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableUsers1738161008068 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS users(
                        id serial primary key,
                        email varchar(100) unique not null,
                        password varchar(250) not null,
                        created_at timestamptz not null,
                        updated_at timestamptz
                    );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE users;`);
  }
}
