import {
  Transform,
  TransformFnParams,
  plainToInstance,
} from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

/**
 * Environment Variables Validation Schema
 * Uses class-validator and class-transformer for type-safe environment variable validation
 */
class EnvironmentVariables {
  @IsString()
  @IsIn(['development', 'production', 'test'])
  NODE_ENV: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: TransformFnParams): number | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? undefined : parsed;
  })
  PORT?: number;

  @IsString()
  DATABASE_URL: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: TransformFnParams): number | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? undefined : parsed;
  })
  DATABASE_POOL_MIN?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: TransformFnParams): number | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? undefined : parsed;
  })
  DATABASE_POOL_MAX?: number;

  @IsString()
  DATABASE_HOST: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: TransformFnParams): number | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? undefined : parsed;
  })
  DATABASE_PORT?: number;

  @IsString()
  DATABASE_USER: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  DATABASE_NAME: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams): string | string[] | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return typeof value === 'string'
      ? value.split(',')
      : (value as string | string[]);
  })
  CORS_ORIGINS?: string | string[];

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }: TransformFnParams): boolean | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  CORS_CREDENTIALS?: boolean;

  @IsOptional()
  @Transform(({ value }: TransformFnParams): string | string[] | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return typeof value === 'string'
      ? value.split(',')
      : (value as string | string[]);
  })
  CORS_METHODS?: string | string[];

  @IsOptional()
  @Transform(({ value }: TransformFnParams): string | string[] | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return typeof value === 'string'
      ? value.split(',')
      : (value as string | string[]);
  })
  CORS_ALLOWED_HEADERS?: string | string[];

  @IsString()
  @IsOptional()
  OPENAPI_TITLE?: string;

  @IsString()
  @IsOptional()
  OPENAPI_DESCRIPTION?: string;

  @IsString()
  @IsOptional()
  OPENAPI_VERSION?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }: TransformFnParams): boolean | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  OPENAPI_ENABLED?: boolean;

  @IsString()
  @IsOptional()
  OPENAPI_OUTPUT_DIR?: string;

  @IsString()
  @IsOptional()
  OPENAPI_FILENAME?: string;

  @IsString()
  BETTER_AUTH_SECRET: string;

  @IsString()
  BETTER_AUTH_URL: string;

  @IsString()
  @IsOptional()
  STRIPE_SECRET_KEY?: string;

  @IsString()
  @IsOptional()
  STRIPE_WEBHOOK_SECRET?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_SECRET?: string;
}

/**
 * List of application-specific environment variables to validate
 * System environment variables (PATH, HOME, etc.) are excluded
 */
const APPLICATION_ENV_VARS = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'DATABASE_POOL_MIN',
  'DATABASE_POOL_MAX',
  'DATABASE_HOST',
  'DATABASE_PORT',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'DATABASE_NAME',
  'CORS_ORIGINS',
  'CORS_CREDENTIALS',
  'CORS_METHODS',
  'CORS_ALLOWED_HEADERS',
  'OPENAPI_TITLE',
  'OPENAPI_DESCRIPTION',
  'OPENAPI_VERSION',
  'OPENAPI_ENABLED',
  'OPENAPI_OUTPUT_DIR',
  'OPENAPI_FILENAME',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

/**
 * Validates environment variables
 * Only validates application-specific variables, ignoring system environment variables
 * @param config - Environment variables object
 * @throws Error if validation fails
 */
export function validateEnvironment(config: Record<string, unknown>): void {
  // Filter to only application-specific environment variables
  const filteredConfig: Record<string, unknown> = {};
  for (const key of APPLICATION_ENV_VARS) {
    if (key in config) {
      filteredConfig[key] = config[key];
    }
  }

  // Use plainToInstance to apply Transform decorators before validation
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    filteredConfig,
    {
      enableImplicitConversion: true,
      exposeDefaultValues: true,
    },
  );

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: true, // Allow missing optional properties
    whitelist: true,
    forbidNonWhitelisted: false, // Don't fail on unknown properties
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => {
        const constraints = Object.values(error.constraints || {});
        return `  - ${error.property}: ${constraints.join(', ')}`;
      })
      .join('\n');

    throw new Error(
      `Environment validation failed:\n${errorMessages}\n\nPlease check your .env file.`,
    );
  }
}
