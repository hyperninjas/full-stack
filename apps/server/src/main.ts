import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
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
  const env = configService.get<string>('env')!;
  const isDev = env === 'development';
  const corsConfig = configService.get<CorsConfiguration>('cors')!;
  const openapiConfig = configService.get<OpenapiConfiguration>('openapi')!;

  if (!isDev) {
    app.use(compression({}));
  }
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: isDev
          ? {
              'default-src': ["'self'", 'https://cdn.jsdelivr.net'],
              'script-src': [
                "'self'",
                "'unsafe-inline'",
                "'wasm-unsafe-eval'",
                "'unsafe-eval'",
                'https://cdn.jsdelivr.net',
              ],
              'connect-src': [
                "'self'",
                'https://cdn.jsdelivr.net',
                'http://localhost:3000',
              ],
            }
          : {
              'default-src': ["'self'", 'https://cdn.jsdelivr.net'],
              'script-src': ["'self'", 'https://cdn.jsdelivr.net'],
              'connect-src': [
                "'self'",
                'https://cdn.jsdelivr.net',
                'http://localhost:3000',
              ],
            },
      },
    }),
  );
  console.log(corsConfig);
  
  app.enableCors({
    origin: corsConfig.origins,
    methods: corsConfig.methods,
    allowedHeaders: corsConfig.allowedHeaders,
    credentials: true
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

  if (openapiConfig.enabled && isDev) {
    const config = new DocumentBuilder()
      .setTitle(openapiConfig.title)
      .setDescription(openapiConfig.description)
      .setVersion(openapiConfig.version)
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    // Generate and save OpenAPI JSON
    try {
      const document = documentFactory();
      const jsonDoc = JSON.stringify(document, null, 2);
      const filename = openapiConfig.filename;
      
      // Resolve path from dist folder to client openapi directory
      // apps/server/dist -> ../../client/openapi
      const clientOutDir = path.resolve(__dirname, '../../client/openapi');
      mkdirSync(clientOutDir, { recursive: true });
      const clientOutFile = path.join(clientOutDir, filename);
      writeFileSync(clientOutFile, jsonDoc, 'utf8');
      Logger.debug(`OpenAPI JSON written to ${clientOutFile}`);
    } catch (error) {
      Logger.error('Failed to generate OpenAPI JSON', error);
    }
  }

  app.setGlobalPrefix('api');
  await app.listen(port);
  Logger.debug(`Server started on http://localhost:${port}`);
  Logger.debug(
    `OpenAPI documentation available at http://localhost:${port}/api`,
  );
}
bootstrap().catch((err) => console.error(err));
