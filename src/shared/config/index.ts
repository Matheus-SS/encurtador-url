export interface AppConfig {
  port: number;
  NODE_ENV: 'development' | 'production';
  corsOrigin: string;
}
export interface DatabaseConfig {
  client: string;
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
}
interface Config {
  app: AppConfig;
  database: DatabaseConfig;
}

function verifyEnvVars(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} not defined`);
  }
  return value;
}

export function validateEnvVars() {
  verifyEnvVars('PORT');
  verifyEnvVars('NODE_ENV');
  verifyEnvVars('CORS_ORIGIN');
  verifyEnvVars('DATABASE_CLIENT');
  verifyEnvVars('DATABASE_HOST');
  verifyEnvVars('DATABASE_PORT');
  verifyEnvVars('DATABASE_USER');
  verifyEnvVars('DATABASE_PASSWORD');
  verifyEnvVars('DATABASE_NAME');
}

export function configuration(): Config {
  return {
    app: {
      port: +(process.env.PORT || 3000),
      NODE_ENV:
        (process.env.NODE_ENV as 'development' | 'production') || 'development',
      corsOrigin: process.env.CORS_ORIGIN || '*',
    },
    database: {
      client: process.env.DATABASE_CLIENT || 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: +(process.env.DATABASE_PORT || 5432),
      user: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || 'root',
      name: process.env.DATABASE_NAME || 'blizzard',
    },
  };
}
