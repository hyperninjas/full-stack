/**
 * Server-Side API Utilities
 * 
 * This module provides utilities for using the API client in Next.js server components
 * and server-side functions with proper caching and authentication.
 */

import { cookies } from 'next/headers';
import { createServerConfig } from './client';
import type { Configuration } from './generated/runtime';

/**
 * Options for creating a server-side API configuration
 */
export interface ServerApiOptions {
  /**
   * Cache tags for Next.js cache invalidation
   * @see https://nextjs.org/docs/app/building-your-application/caching#fetch-optionsnexttags-and-revalidatetag
   */
  tags?: string[];
  
  /**
   * Revalidation time in seconds
   * @see https://nextjs.org/docs/app/building-your-application/caching#fetch-optionsnextrevalidate
   */
  revalidate?: number | false;
  
  /**
   * Cache mode
   * @see https://nextjs.org/docs/app/building-your-application/caching#fetch-optionscache
   */
  cache?: RequestCache;
  
  /**
   * Authentication token (if not using cookies)
   */
  accessToken?: string;
  
  /**
   * Cookie name for authentication token
   * @default 'auth_token'
   */
  authCookieName?: string;
}

/**
 * Get the API configuration for server-side usage
 * Automatically extracts auth token from cookies if available
 * 
 * @example
 * ```tsx
 * // In a Server Component
 * export default async function Page() {
 *   const config = await getServerApiConfig({
 *     tags: ['users'],
 *     revalidate: 60
 *   });
 *   
 *   const api = new UsersApi(config);
 *   const users = await api.getUsers();
 *   
 *   return <UserList users={users} />;
 * }
 * ```
 */
export async function getServerApiConfig(
  options: ServerApiOptions = {}
): Promise<Configuration> {
  const {
    tags,
    revalidate,
    cache,
    accessToken,
    authCookieName = 'auth_token',
  } = options;
  
  // Get auth token from cookies if not provided
  let token = accessToken;
  if (!token) {
    try {
      const cookieStore = await cookies();
      const authCookie = cookieStore.get(authCookieName);
      token = authCookie?.value;
    } catch (error) {
      // Cookies might not be available in all contexts
      console.warn('Failed to read auth cookie:', error);
    }
  }
  
  return createServerConfig({
    tags,
    revalidate,
    cache,
    accessToken: token,
  });
}

/**
 * Create an API service instance for server-side usage
 * This is a convenience function that combines getServerApiConfig with service instantiation
 * 
 * @example
 * ```tsx
 * // In a Server Component
 * export default async function Page() {
 *   const healthApi = await createServerApi(HealthApi, {
 *     tags: ['health'],
 *     revalidate: 30
 *   });
 *   
 *   const health = await healthApi.healthControllerCheck();
 *   
 *   return <HealthStatus health={health} />;
 * }
 * ```
 */
export async function createServerApi<T>(
  ApiClass: new (config: Configuration) => T,
  options: ServerApiOptions = {}
): Promise<T> {
  const config = await getServerApiConfig(options);
  return new ApiClass(config);
}

/**
 * Revalidate cache by tag
 * This is a re-export of Next.js's revalidateTag for convenience
 * 
 * @example
 * ```ts
 * // In a Server Action
 * 'use server'
 * 
 * export async function updateUser(userId: string, data: UpdateUserDto) {
 *   const api = await createServerApi(UsersApi);
 *   await api.updateUser({ userId, updateUserDto: data });
 *   
 *   // Revalidate the cache
 *   revalidateApiCache('users');
 * }
 * ```
 */
export { revalidateTag as revalidateApiCache } from 'next/cache';

/**
 * Revalidate cache by path
 * This is a re-export of Next.js's revalidatePath for convenience
 */
export { revalidatePath as revalidateApiPath } from 'next/cache';
