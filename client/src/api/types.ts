/**
 * API Types and Utilities
 * 
 * This module re-exports all generated types and provides additional
 * utility types for better developer experience.
 */

// Re-export all generated types and models
export * from './generated/models';
export * from './generated/apis';
export type { Configuration, ConfigurationParameters } from './generated/runtime';

// Re-export middleware types
export type { Middleware, RequestContext, ResponseContext, ErrorContext } from './generated/runtime';

// Export custom error type
export { ApiError } from './middleware';

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
  details?: Record<string, any>;
}

/**
 * Utility type to extract the response type from an API method
 */
export type ApiMethodResponse<T extends (...args: any[]) => Promise<any>> = 
  Awaited<ReturnType<T>>;

/**
 * Utility type to extract the parameters from an API method
 */
export type ApiMethodParams<T extends (...args: any[]) => any> = 
  Parameters<T>[0];
