/**
 * React Hooks for API Client
 * 
 * This module provides React hooks for using the API client in client components.
 */

'use client';

import { useMemo } from 'react';
import { createClientConfig } from './client';
import type { Configuration } from './generated/runtime';
import {Configuration as GeneratedConfiguration} from './generated/runtime';
import { 
  createAuthMiddleware, 
  createErrorHandlingMiddleware, 
  createLoggingMiddleware,
  combineMiddleware,
} from './middleware';

/**
 * Options for useApiClient hook
 */
export interface UseApiClientOptions {
  /**
   * Authentication token
   */
  accessToken?: string;
  
  /**
   * Function to get the authentication token
   */
  getAccessToken?: () => string | null | Promise<string | null>;
  
  /**
   * Whether to enable logging middleware
   * @default true in development
   */
  enableLogging?: boolean;
  
  /**
   * Whether to enable error handling middleware
   * @default true
   */
  enableErrorHandling?: boolean;
}

/**
 * Hook to get a configured API client for use in client components
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const config = useApiClient({
 *     getAccessToken: () => localStorage.getItem('token')
 *   });
 *   
 *   const api = new HealthApi(config);
 *   
 *   // Use the api...
 * }
 * ```
 */
export function useApiClient(options: UseApiClientOptions = {}): Configuration {
  const {
    accessToken,
    getAccessToken,
    enableLogging = process.env.NODE_ENV === 'development',
    enableErrorHandling = true,
  } = options;
  
  const config = useMemo(() => {
    const middleware = combineMiddleware(
      getAccessToken ? createAuthMiddleware(getAccessToken) : undefined,
      enableErrorHandling ? createErrorHandlingMiddleware() : undefined,
      enableLogging ? createLoggingMiddleware() : undefined,
    );
    
    return createClientConfig(accessToken);
  }, [accessToken, getAccessToken, enableLogging, enableErrorHandling]);
  
  // Add middleware to the configuration
  return useMemo(() => {
    const middleware = combineMiddleware(
      getAccessToken ? createAuthMiddleware(getAccessToken) : undefined,
      enableErrorHandling ? createErrorHandlingMiddleware() : undefined,
      enableLogging ? createLoggingMiddleware() : undefined,
    );
    
    const baseConfig = createClientConfig(accessToken);
    
    // Create a new configuration with middleware
    return new GeneratedConfiguration({
      basePath: baseConfig.basePath,
      credentials: baseConfig.credentials,
      headers: baseConfig.headers,
      accessToken: baseConfig.accessToken,
      middleware,
    });
  }, [accessToken, getAccessToken, enableLogging, enableErrorHandling]);
}

/**
 * Hook to create an API service instance
 * This is a convenience hook that combines useApiClient with service instantiation
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const healthApi = useApi(HealthApi, {
 *     getAccessToken: () => localStorage.getItem('token')
 *   });
 *   
 *   // Use healthApi...
 * }
 * ```
 */
export function useApi<T>(
  ApiClass: new (config: Configuration) => T,
  options: UseApiClientOptions = {}
): T {
  const config = useApiClient(options);
  
  return useMemo(() => new ApiClass(config), [ApiClass, config]);
}
