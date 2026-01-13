/**
 * Central export point for all config-related modules
 */
export { appConfig, type AppConfig } from './app.config';
export { secretsConfig, type SecretsConfig } from './secrets.config';
export { validate, EnvValidation } from './env.validation';
export { redactSecrets, parseCommaSeparated } from './config-utils';
export {
  type Configuration,
  type CorsConfiguration,
  type OpenapiConfiguration,
  type AuthConfiguration,
  type DatabaseConfiguration,
} from './configuration';

// Re-export default for backward compatibility
export { default } from './configuration';
