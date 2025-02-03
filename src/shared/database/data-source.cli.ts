import { UsersEntity } from '@src/modules/users/domain/entities/user.entity';
import { config as dotenvConfig } from 'dotenv';
import { DataSource } from 'typeorm';

dotenvConfig({ path: '.env.development' });

const typeOrmConfig = {
  type: process.env.DATABASE_CLIENT as 'postgres',
  host: process.env.DATABASE_HOST,
  port: +(process.env.DATABASE_PORT || 5432),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [UsersEntity],
  synchronize: false,
  migrations: [`dist/shared/database/migrations/*.js`],
};

const dataSource = new DataSource(typeOrmConfig);

export default dataSource;
