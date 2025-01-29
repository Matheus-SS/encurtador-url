export interface AppConfig {
  port: number;
  NODE_ENV: 'development' | 'production';
  corsOrigin: string;
}

interface Config {
  app: AppConfig;
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
}

export function configuration(): Config {
  return {
    app: {
      port: +(process.env.PORT || 3000),
      NODE_ENV:
        (process.env.NODE_ENV as 'development' | 'production') || 'development',
      corsOrigin: process.env.CORS_ORIGIN || '*',
    },
  };
}
