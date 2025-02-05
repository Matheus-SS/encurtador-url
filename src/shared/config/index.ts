export interface AppConfig {
  port: number;
  NODE_ENV: 'development' | 'production';
  corsOrigin: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtIssuer: string;
  apiUrl: string;
  FLAG_DEBUG_REDIS_REPOSITORY: number;
}
export interface DatabaseConfig {
  client: string;
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
  redisHost: string;
  redisPort: number;
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
  verifyEnvVars('JWT_SECRET');
  verifyEnvVars('JWT_EXPIRES_IN');
  verifyEnvVars('JWT_ISSUER');
  verifyEnvVars('API_URL');
  verifyEnvVars('FLAG_DEBUG_REDIS_REPOSITORY');
  verifyEnvVars('REDIS_HOST');
  verifyEnvVars('REDIS_PORT');
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
      NODE_ENV: process.env.NODE_ENV as 'development' | 'production',
      corsOrigin: process.env.CORS_ORIGIN as string,
      jwtSecret: process.env.JWT_SECRET as string,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN as string,
      jwtIssuer: process.env.JWT_ISSUER as string,
      apiUrl: process.env.API_URL as string,
      FLAG_DEBUG_REDIS_REPOSITORY: +(
        process.env.FLAG_DEBUG_REDIS_REPOSITORY || 0
      ),
    },
    database: {
      client: process.env.DATABASE_CLIENT as string,
      host: process.env.DATABASE_HOST as string,
      port: +(process.env.DATABASE_PORT || 5432),
      user: process.env.DATABASE_USER as string,
      password: process.env.DATABASE_PASSWORD as string,
      name: process.env.DATABASE_NAME as string,
      redisHost: process.env.REDIS_HOST as string,
      redisPort: +(process.env.REDIS_PORT || 6379),
    },
  };
}
