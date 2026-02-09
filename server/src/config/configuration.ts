/**
 * Re-export configuration types and namespaced configs
 */
import { appConfig } from './app.config';
import { secretsConfig } from './secrets.config';

export { appConfig, type AppConfig } from './app.config';
export { secretsConfig, type SecretsConfig } from './secrets.config';
export { validate } from './env.validation';
export { redactSecrets, parseCommaSeparated } from './config-utils';

/**
 * Legacy type definitions for backward compatibility.
 * Prefer using namespaced configs via injection.
 */
export type CorsConfiguration = {
  origins: string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
};

export type OpenapiConfiguration = {
  title: string;
  description: string;
  version: string;
  enabled: boolean;
  outputDir: string;
  filename: string;
};

export type AuthConfiguration = {
  betterAuthSecret: string;
  betterAuthUrl: string;
};

export type DatabaseConfiguration = {
  url: string;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

export type Configuration = {
  port: number;
  env: string;
  isDev: boolean;
  cors: CorsConfiguration;
  openapi: OpenapiConfiguration;
  auth: AuthConfiguration;
  stripe: {
    secretKey: string;
    webhookSecret: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
  };
  database: DatabaseConfiguration;
};

/**
 * Default export for legacy config loading.
 * New code should use namespaced configs instead.
 * @deprecated Use appConfig and secretsConfig instead
 */
const configuration = (): Configuration => {
  const app = appConfig();
  const secrets = secretsConfig();

  return {
    ...app,
    auth: secrets.auth,
    stripe: secrets.stripe,
    google: secrets.google,
    database: secrets.database,
  };
};

export default configuration;
