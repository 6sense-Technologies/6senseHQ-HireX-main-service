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
  EMAIL_HOST: string;
  EMAIL_USERNAME: string;
  EMAIL_PASSWORD: string;
  EMAIL_SERVICE_PORT: number;
  EMAIL_VERIFICATION_SECRET: string;
  EMAIL_VERIFICATION_SUCCESS_REDIRECT: string;
  EMAIL_VERIFICATION_FAILED_REDIRECT: string;
  EMAIL_VERIFY_URL: string;
  EMAIL_SENDER: string;
}
