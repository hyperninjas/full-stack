import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import { mkdirSync, writeFileSync } from 'fs';
import helmet from 'helmet';
import path from 'path';
import { AppModule } from './app.module';
import {
  CorsConfiguration,
  OpenapiConfiguration,
} from './config/configuration';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';
import { HttpAdapterHost } from '@nestjs/core';

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

  // Compression - enabled for all environments for better performance
  app.use(
    compression({
      level: 6, // Compression level (0-9)
      threshold: 1024, // Only compress responses larger than 1KB
    }),
  );
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

  app.enableCors({
    origin: corsConfig.origins,
    methods: corsConfig.methods,
    allowedHeaders: corsConfig.allowedHeaders,
    credentials: true,
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

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

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

      // Resolve path from server cwd to client openapi directory
      // process.cwd() is apps/server, go up one level then to apps/client
      const clientOutDir = path.resolve(process.cwd(), '../client/openapi');
      mkdirSync(clientOutDir, { recursive: true });
      const clientOutFile = path.join(clientOutDir, filename);
      writeFileSync(clientOutFile, jsonDoc, 'utf8');
      Logger.debug(`OpenAPI JSON written to ${clientOutFile}`);
    } catch (error) {
      Logger.error('Failed to generate OpenAPI JSON', error);
    }
  }

  app.setGlobalPrefix('api');

  // Enable graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port);
  Logger.log(`🚀 Server started on http://localhost:${port}`);
  if (openapiConfig.enabled && isDev) {
    Logger.log(
      `📚 OpenAPI documentation available at http://localhost:${port}/api`,
    );
  }

  // Graceful shutdown handling
  const gracefulShutdown = async (signal: string) => {
    Logger.log(`\n${signal} received. Starting graceful shutdown...`);
    try {
      await app.close();
      Logger.log('✅ Application closed successfully');
      process.exit(0);
    } catch (error) {
      Logger.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => {
    void gracefulShutdown('SIGTERM');
  });
  process.on('SIGINT', () => {
    void gracefulShutdown('SIGINT');
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    Logger.error('Uncaught Exception:', error);
    void gracefulShutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    void gracefulShutdown('unhandledRejection');
  });
}

bootstrap().catch((err) => {
  Logger.error('Failed to start server:', err);
  process.exit(1);
});
