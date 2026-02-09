import { registerAs } from '@nestjs/config';
import { parseCommaSeparated } from './config-utils';

/**
 * Non-sensitive application configuration.
 * Safe to log and expose in debugging.
 */
export const appConfig = registerAs('app', () => {
  const rawOrigins = parseCommaSeparated(process.env.CORS_ORIGINS);
  const rawHeaders = parseCommaSeparated(process.env.CORS_ALLOWED_HEADERS);
  const credentials = process.env.CORS_CREDENTIALS?.toLowerCase() === 'true';

  // Sanitize wildcards if credentials are true (browser requirement)
  const origins =
    credentials && rawOrigins.includes('*')
      ? ['http://localhost:3000', 'http://localhost:3001']
      : rawOrigins;

  const allowedHeaders =
    credentials && rawHeaders.includes('*')
      ? [
          'Content-Type',
          'Authorization',
          'Accept',
          'Origin',
          'X-Requested-With',
          'sentry-trace',
          'baggage',
        ]
      : rawHeaders;

  return {
    port: parseInt(process.env.PORT || '4000', 10),
    env: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development',
    cors: {
      origins,
      credentials,
      methods: parseCommaSeparated(process.env.CORS_METHODS),
      allowedHeaders,
    },
    openapi: {
      title: process.env.OPENAPI_TITLE || 'Server API',
      description: process.env.OPENAPI_DESCRIPTION || 'Server API',
      version: process.env.OPENAPI_VERSION || '1.0.0',
      enabled: process.env.OPENAPI_ENABLED?.toLowerCase() === 'true',
      outputDir: process.env.OPENAPI_OUTPUT_DIR || 'openapi',
      filename: process.env.OPENAPI_FILENAME || 'openapi.json',
    },
  };
});

export type AppConfig = ReturnType<typeof appConfig>;
