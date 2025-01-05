import './instrument';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';

import helmet from 'helmet';
import * as compression from 'compression';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SentryFilter } from './sentry/sentry.filter';
import { appConfig } from './configuration/app.config';
// import * as fs from 'fs';
// import { writeFile } from 'fs/promises';
async function bootstrap() {
  // const httpsOptions = {
  //   key: fs.readFileSync('./server.key'),
  //   cert: fs.readFileSync('./server.cert'),
  // };

  const app = await NestFactory.create(AppModule);

  // const app = await NestFactory.create(AppModule);

  const appLogger = new Logger('HireX logger', { timestamp: true });
  app.useGlobalPipes(new ValidationPipe());
  appLogger.log('Enabled validation pipe....OK');
  appLogger.log('Using Compresson module....OK');
  app.use(helmet()); //helmet
  // // Enable CORS for external access
  // app.enableCors({
  //   origin: '*', // Allow all origins (adjust for production)
  // });
  // app.setGlobalPrefix('');
  app.enableCors();
  appLogger.log('Enabled CORS....OK');

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));
  appLogger.log('Using Sentry Error handler ...OK');

  const configService: ConfigService = app.get<ConfigService>(ConfigService); //config

  const port = configService.get('APP_PORT');
  app.use(compression()); //compression

  appLogger.log('Using Helmet module....OK');
  appLogger.log(appConfig);
  const config = new DocumentBuilder()
    .setTitle('Hirex')
    .setDescription('API for hirex platform')
    .setVersion('1.0')
    .addTag('hirex')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT Token',
      in: 'header',
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      basePath: '/api',
    },
    customSiteTitle: 'HireX app',
    url: configService.get('LAN_URL'),
  });

  appLogger.log('intialized swagger use /api to access');
  appLogger.log('App running on port: ' + port);

  await app.listen(port, configService.get('LAN_IP'));
}
bootstrap();
