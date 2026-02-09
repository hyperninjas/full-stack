/**
 * API Client Configuration and Factory
 * 
 * This module provides a centralized API client factory that configures
 * the OpenAPI-generated client for Next.js usage with proper environment
 * handling, authentication, and middleware support.
 */

import { Configuration } from './generated/runtime';
import type { ConfigurationParameters, Middleware } from './generated/runtime';

/**
 * Get the API base URL based on the environment
 * - Client-side: Uses NEXT_PUBLIC_API_BASE_URL
 * - Server-side: Uses API_BASE_URL (can be internal URL) or falls back to NEXT_PUBLIC_API_BASE_URL
 */
export function getApiBaseUrl(): string {
  // Check if we're on the server
  const isServer = typeof window === 'undefined';
  
  if (isServer) {
    // Server-side: prefer internal API_BASE_URL, fallback to public URL, then default
    // We append /api because the server now has a global prefix
    const baseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
  }
  
  // Client-side: use relative path to go through Next.js proxy
  return '/api';
}

/**
 * Get the API timeout from environment or use default
 */
export function getApiTimeout(): number {
  const timeout = process.env.API_TIMEOUT;
  return timeout ? parseInt(timeout, 10) : 30000;
}

/**
 * Options for creating an API client configuration
 */
export interface ApiClientOptions {
  /**
   * Override the base path (defaults to environment-based URL)
   */
  basePath?: string;
  
  /**
   * Authentication token (will be added to Authorization header)
   */
  accessToken?: string | (() => string | Promise<string>);
  
  /**
   * Additional headers to include in all requests
   */
  headers?: Record<string, string>;
  
  /**
   * Credentials mode for fetch requests
   * @default 'include'
   */
  credentials?: RequestCredentials;
  
  /**
   * Additional middleware to apply
   */
  middleware?: Middleware[];
  
  /**
   * Custom fetch implementation
   */
  fetchApi?: typeof fetch;
  
  /**
   * Next.js fetch options (for server-side)
   */
  nextFetchOptions?: {
    /**
     * Cache tags for Next.js cache invalidation
     */
    tags?: string[];
    
    /**
     * Revalidation time in seconds
     */
    revalidate?: number | false;
    
    /**
     * Cache mode
     */
    cache?: RequestCache;
  };
}

/**
 * Create an API client configuration
 * 
 * @example
 * ```ts
 * // Client-side usage
 * const config = createApiConfig({
 *   accessToken: 'your-token'
 * });
 * 
 * // Server-side usage with Next.js caching
 * const config = createApiConfig({
 *   nextFetchOptions: {
 *     tags: ['users'],
 *     revalidate: 60
 *   }
 * });
 * ```
 */
export function createApiConfig(options: ApiClientOptions = {}): Configuration {
  const {
    basePath = getApiBaseUrl(),
    accessToken,
    headers = {},
    credentials = 'include',
    middleware = [],
    fetchApi,
    nextFetchOptions,
  } = options;

  const configParams: ConfigurationParameters = {
    basePath,
    credentials,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    middleware,
  };

  // Add access token if provided
  if (accessToken) {
    configParams.accessToken = accessToken;
  }

  // Add custom fetch implementation for Next.js server-side caching
  if (nextFetchOptions && typeof window === 'undefined') {
    configParams.fetchApi = (url: RequestInfo | URL, init?: RequestInit) => {
      const fetchOptions: RequestInit = {
        ...init,
        next: nextFetchOptions as any,
      };
      return fetch(url, fetchOptions);
    };
  } else if (fetchApi) {
    configParams.fetchApi = fetchApi;
  }

  return new Configuration(configParams);
}

/**
 * Create a default API configuration for client-side usage
 * This is a convenience function that uses sensible defaults
 */
export function createClientConfig(accessToken?: string): Configuration {
  return createApiConfig({
    accessToken,
    credentials: 'include',
  });
}

/**
 * Create a default API configuration for server-side usage
 * 
 * @param options - Server-side options
 * @example
 * ```ts
 * const config = createServerConfig({
 *   tags: ['users'],
 *   revalidate: 60
 * });
 * ```
 */
export function createServerConfig(options?: {
  tags?: string[];
  revalidate?: number | false;
  cache?: RequestCache;
  accessToken?: string;
}): Configuration {
  return createApiConfig({
    accessToken: options?.accessToken,
    nextFetchOptions: {
      tags: options?.tags,
      revalidate: options?.revalidate,
      cache: options?.cache,
    },
  });
}
