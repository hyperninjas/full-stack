/**
 * API Client - Main Entry Point
 * 
 * This module provides a centralized export for all API-related functionality.
 * Import from this module to access the API client, types, hooks, and utilities.
 * 
 * @example
 * ```tsx
 * // Client Component
 * import { useApi, HealthApi } from '@/api';
 * 
 * function MyComponent() {
 *   const healthApi = useApi(HealthApi);
 *   // ...
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Server Component
 * import { createServerApi, HealthApi } from '@/api';
 * 
 * async function MyServerComponent() {
 *   const healthApi = await createServerApi(HealthApi);
 *   // ...
 * }
 * ```
 */

// Client configuration and factory
export {
  createApiConfig,
  createClientConfig,
  createServerConfig,
  getApiBaseUrl,
  getApiTimeout,
} from './client';
export type { ApiClientOptions } from './client';

// Middleware
export {
  createAuthMiddleware,
  createErrorHandlingMiddleware,
  createLoggingMiddleware,
  createRetryMiddleware,
  createTimeoutMiddleware,
  combineMiddleware,
  ApiError,
} from './middleware';

// Client-side hooks
export { useApiClient, useApi } from './hooks';
export type { UseApiClientOptions } from './hooks';

// Server-side utilities should be imported directly from '@/api/server'
// export * from './server';

// Types and models
export * from './types';

// Generated API services
export * from './generated/apis';
export * from './generated/models';