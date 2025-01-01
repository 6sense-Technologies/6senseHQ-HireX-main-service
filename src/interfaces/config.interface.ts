export interface IConfig {
  APP_PORT: number;
  DATABASE_URL: string;
  SENTRY_DSN: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRE: string;
  JWT_EXPIRE_REFRESH_TOKEN: string;
  SALT_ROUND: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}
