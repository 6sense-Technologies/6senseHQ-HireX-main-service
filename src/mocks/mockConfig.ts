import { IConfig } from 'src/interfaces/config.interface';

export const mockConfig: IConfig = {
  APP_PORT: 3000,
  DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
  SENTRY_DSN: 'mock-sentry-dsn',
  JWT_SECRET: 'mock-jwt-secret',
  JWT_REFRESH_SECRET: 'mock-jwt-refresh-secret',
  JWT_EXPIRE: '1h',
  JWT_EXPIRE_REFRESH_TOKEN: '7d',
  SALT_ROUND: '10',
  GOOGLE_CLIENT_ID: 'mock-google-client-id',
  GOOGLE_CLIENT_SECRET: 'mock-google-client-secret',
  EMAIL_HOST: 'smtp.mailtrap.io',
  EMAIL_USERNAME: 'mock-email-username',
  EMAIL_PASSWORD: 'mock-email-password',
  EMAIL_SERVICE_PORT: 2525,
  EMAIL_VERIFICATION_SECRET: 'mock-email-verification-secret',
  EMAIL_VERIFICATION_SUCCESS_REDIRECT: 'http://localhost:3000/success',
  EMAIL_VERIFICATION_FAILED_REDIRECT: 'http://localhost:3000/fail',
  EMAIL_VERIFY_URL: 'http://localhost:3000/verify',
  EMAIL_SENDER: 'noreply@example.com',
};
