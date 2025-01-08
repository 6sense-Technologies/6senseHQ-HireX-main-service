import { IConfig } from 'src/interfaces/config.interface';
import * as dotenv from 'dotenv';
dotenv.config();

export const appConfig: IConfig = {
  APP_PORT: parseInt(process.env.APP_PORT),
  DATABASE_URL: process.env.DATABASE_URL,
  SENTRY_DSN: process.env.SENTRY_DSN,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE,
  JWT_EXPIRE_REFRESH_TOKEN: process.env.JWT_EXPIRE_REFRESH_TOKEN,
  SALT_ROUND: process.env.SALT_ROUND,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_SERVICE_PORT: parseInt(process.env.EMAIL_SERVICE_PORT),
  EMAIL_VERIFICATION_SECRET: process.env.EMAIL_VERIFICATION_SECRET,
  EMAIL_VERIFICATION_SUCCESS_REDIRECT:
    process.env.EMAIL_VERIFICATION_SUCCESS_REDIRECT,
  EMAIL_VERIFICATION_FAILED_REDIRECT:
    process.env.EMAIL_VERIFICATION_FAILED_REDIRECT,
  EMAIL_VERIFY_URL: process.env.EMAIL_VERIFY_URL,
};
