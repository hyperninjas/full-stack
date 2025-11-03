import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import {
  CorsConfiguration,
  OpenapiConfiguration,
} from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    logger: ['log', 'error', 'warn', 'debug', 'fatal'],
  });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port')!;
  const corsConfig = configService.get<CorsConfiguration>('cors')!;
  const openapiConfig = configService.get<OpenapiConfiguration>('openapi')!;

  app.use(compression());
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'", 'https://cdn.jsdelivr.net'],
          'script-src': [
            "'self'",
            "'unsafe-inline'",
            'https://cdn.jsdelivr.net',
          ],
          'connect-src': [
            "'self'",
            'https://cdn.jsdelivr.net',
            'http://localhost:3000',
            'http://localhost:4000',
          ],
        },
      },
    }),
  );
  app.enableCors({
    origin: corsConfig.origins,
    credentials: corsConfig.credentials,
    methods: corsConfig.methods,
    // allowedHeaders: corsConfig.allowedHeaders,
    allowedHeaders:
      corsConfig.allowedHeaders.length > 0
        ? corsConfig.allowedHeaders
        : [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
          ],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      skipMissingProperties: false,
      skipUndefinedProperties: true,
      stopAtFirstError: false,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const config = new DocumentBuilder()
    .setTitle(openapiConfig.title)
    .setDescription(openapiConfig.description)
    .setVersion(openapiConfig.version)
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.setGlobalPrefix('api');
  await app.listen(port);
  Logger.debug(`Server started on http://localhost:${port}`);
  Logger.debug(
    `OpenAPI documentation available at http://localhost:${port}/api`,
  );
}
bootstrap().catch((err) => console.error(err));
