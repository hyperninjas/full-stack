import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsIn,
  IsUrl,
  Min,
  Max,
  validateSync,
} from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';

/**
 * Transforms string 'true'/'false' to boolean
 */
const ToBoolean = () =>
  Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return false;
  });

/**
 * Transforms string to number
 */
const ToNumber = () =>
  Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  });

/**
 * Validated environment variables schema.
 * All required variables are validated at startup.
 */
export class EnvValidation {
  // Application
  @IsIn(['development', 'production', 'test'])
  NODE_ENV!: string;

  @ToNumber()
  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT: number = 4000;

  // Database
  @IsString()
  DATABASE_URL!: string;

  @IsString()
  DATABASE_HOST!: string;

  @ToNumber()
  @IsNumber()
  @IsOptional()
  DATABASE_PORT: number = 5432;

  @IsString()
  DATABASE_USER!: string;

  @IsString()
  DATABASE_PASSWORD!: string;

  @IsString()
  DATABASE_NAME!: string;

  // Auth
  @IsString()
  BETTER_AUTH_SECRET!: string;

  @IsUrl({ require_tld: false })
  BETTER_AUTH_URL!: string;

  // CORS
  @IsString()
  CORS_ORIGINS!: string;

  @ToBoolean()
  @IsBoolean()
  @IsOptional()
  CORS_CREDENTIALS: boolean = false;

  @IsString()
  @IsOptional()
  CORS_METHODS: string = 'GET,POST,PUT,DELETE,OPTIONS';

  @IsString()
  @IsOptional()
  CORS_ALLOWED_HEADERS: string = 'Content-Type,Authorization,Accept';

  // OpenAPI
  @IsString()
  @IsOptional()
  OPENAPI_TITLE: string = 'Server API';

  @IsString()
  @IsOptional()
  OPENAPI_DESCRIPTION: string = 'Server API';

  @IsString()
  @IsOptional()
  OPENAPI_VERSION: string = '1.0.0';

  @ToBoolean()
  @IsBoolean()
  @IsOptional()
  OPENAPI_ENABLED: boolean = false;

  @IsString()
  @IsOptional()
  OPENAPI_OUTPUT_DIR: string = 'openapi';

  @IsString()
  @IsOptional()
  OPENAPI_FILENAME: string = 'openapi.json';

  // Stripe
  @IsString()
  STRIPE_SECRET_KEY!: string;

  @IsString()
  STRIPE_WEBHOOK_SECRET!: string;

  // Google OAuth
  @IsString()
  GOOGLE_CLIENT_ID!: string;

  @IsString()
  GOOGLE_CLIENT_SECRET!: string;

  // Trusted Origins
  @IsString()
  @IsOptional()
  TRUSTED_ORIGINS?: string;
}

/**
 * Validates environment variables using class-validator.
 * Throws descriptive errors on validation failure.
 */
export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvValidation, config, {
    enableImplicitConversion: false,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    forbidUnknownValues: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map((error) => {
      const constraints = error.constraints
        ? Object.values(error.constraints).join(', ')
        : 'Invalid value';
      return `  - ${error.property}: ${constraints}`;
    });

    throw new Error(
      `Environment validation failed:\n${errorMessages.join('\n')}`,
    );
  }

  return validatedConfig;
}
