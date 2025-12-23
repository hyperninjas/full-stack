/**
 * API Middleware Utilities
 * 
 * This module provides middleware for the OpenAPI-generated client
 * to handle common concerns like authentication, error handling, and logging.
 */

import type { Middleware, RequestContext, ResponseContext, ErrorContext } from './generated/runtime';

/**
 * Create an authentication middleware that injects a bearer token
 * 
 * @param getToken - Function to retrieve the auth token
 * @example
 * ```ts
 * const authMiddleware = createAuthMiddleware(() => localStorage.getItem('token'));
 * ```
 */
export function createAuthMiddleware(
  getToken: () => string | null | Promise<string | null>
): Middleware {
  return {
    async pre(context: RequestContext) {
      const token = await Promise.resolve(getToken());
      
      if (token) {
        context.init.headers = {
          ...context.init.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      
      return context;
    },
  };
}

/**
 * Create a logging middleware for development
 * Only logs in development mode
 */
export function createLoggingMiddleware(): Middleware {
  const isDev = process.env.NODE_ENV === 'development';
  
  return {
    async pre(context: RequestContext) {
      if (isDev) {
        console.log('[API Request]', {
          method: context.init.method,
          url: context.url,
          headers: context.init.headers,
        });
      }
      return context;
    },
    
    async post(context: ResponseContext) {
      if (isDev) {
        console.log('[API Response]', {
          status: context.response.status,
          statusText: context.response.statusText,
          url: context.url,
        });
      }
      return context.response;
    },
  };
}

/**
 * Custom API Error class with additional context
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public url: string,
    public response?: Response,
    message?: string
  ) {
    super(message || `API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
  
  /**
   * Check if the error is a specific HTTP status code
   */
  is(status: number): boolean {
    return this.status === status;
  }
  
  /**
   * Check if the error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
  
  /**
   * Check if the error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }
  
  /**
   * Get the response body as JSON
   */
  async getResponseJson<T = any>(): Promise<T | null> {
    if (!this.response) return null;
    
    try {
      const clone = this.response.clone();
      return await clone.json();
    } catch {
      return null;
    }
  }
  
  /**
   * Get the response body as text
   */
  async getResponseText(): Promise<string | null> {
    if (!this.response) return null;
    
    try {
      const clone = this.response.clone();
      return await clone.text();
    } catch {
      return null;
    }
  }
}

/**
 * Create an error handling middleware
 * Transforms errors into ApiError instances with additional context
 */
export function createErrorHandlingMiddleware(): Middleware {
  return {
    async post(context: ResponseContext) {
      const { response, url } = context;
      
      // If response is not ok, throw an ApiError
      if (!response.ok) {
        throw new ApiError(
          response.status,
          response.statusText,
          url,
          response.clone()
        );
      }
      
      return response;
    },
    
    async onError(context: ErrorContext) {
      const { error, url, response } = context;
      
      // If it's already an ApiError, just rethrow it
      if (error instanceof ApiError) {
        throw error;
      }
      
      // If we have a response, create an ApiError
      if (response) {
        throw new ApiError(
          response.status,
          response.statusText,
          url,
          response.clone(),
          error instanceof Error ? error.message : String(error)
        );
      }
      
      // Network error or other error
      throw error;
    },
  };
}

/**
 * Create a retry middleware for failed requests
 * 
 * @param options - Retry options
 */
export function createRetryMiddleware(options: {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number;
  
  /**
   * Delay between retries in milliseconds
   * @default 1000
   */
  retryDelay?: number;
  
  /**
   * HTTP status codes that should trigger a retry
   * @default [408, 429, 500, 502, 503, 504]
   */
  retryableStatuses?: number[];
  
  /**
   * Whether to use exponential backoff
   * @default true
   */
  exponentialBackoff?: boolean;
} = {}): Middleware {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryableStatuses = [408, 429, 500, 502, 503, 504],
    exponentialBackoff = true,
  } = options;
  
  let retryCount = 0;
  
  return {
    async onError(context: ErrorContext) {
      const { response, fetch, url, init } = context;
      
      // Check if we should retry
      const shouldRetry = 
        retryCount < maxRetries &&
        response &&
        retryableStatuses.includes(response.status);
      
      if (!shouldRetry) {
        retryCount = 0; // Reset for next request
        return undefined; // Let the error propagate
      }
      
      // Calculate delay with optional exponential backoff
      const delay = exponentialBackoff
        ? retryDelay * Math.pow(2, retryCount)
        : retryDelay;
      
      retryCount++;
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      try {
        const newResponse = await fetch(url, init);
        retryCount = 0; // Reset on success
        return newResponse;
      } catch (error) {
        // If retry fails, let it propagate to try again or fail
        return undefined;
      }
    },
  };
}

/**
 * Create a request timeout middleware
 * 
 * @param timeoutMs - Timeout in milliseconds
 */
export function createTimeoutMiddleware(timeoutMs: number = 30000): Middleware {
  return {
    async pre(context: RequestContext) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      // Store the timeout ID so we can clear it later
      (context.init as any).__timeoutId = timeoutId;
      
      context.init.signal = controller.signal;
      
      return context;
    },
    
    async post(context: ResponseContext) {
      // Clear the timeout
      const timeoutId = (context.init as any).__timeoutId;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      return context.response;
    },
    
    async onError(context: ErrorContext) {
      // Clear the timeout on error
      const timeoutId = (context.init as any).__timeoutId;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      return undefined;
    },
  };
}

/**
 * Combine multiple middleware into a single array
 */
export function combineMiddleware(...middleware: (Middleware | undefined)[]): Middleware[] {
  return middleware.filter((m): m is Middleware => m !== undefined);
}
