'use client';

import { PropsWithChildren } from 'react';
import axiosFetcher from 'services/axios/axiosFetcher';
import { SWRConfig, type SWRConfiguration } from 'swr';

/**
 * SWR Configuration with Enterprise Optimizations
 * - Smart retry logic (skip 4xx errors)
 * - Exponential backoff
 * - Optimized cache management
 * - Error handling callbacks
 */
const SWRConfiguration = ({ children }: PropsWithChildren) => {
  const config: SWRConfiguration = {
    fetcher: axiosFetcher,
    // Cache configuration
    revalidateIfStale: true,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 2000, // Dedupe requests within 2 seconds
    focusThrottleInterval: 5000, // Throttle focus revalidation to 5 seconds

    // Retry configuration
    shouldRetryOnError: (error) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry on network errors and 5xx errors
      return true;
    },
    errorRetryCount: 3,
    errorRetryInterval: 5000, // Base retry interval

    // Exponential backoff retry logic
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      // Don't retry if shouldRetryOnError returned false
      const shouldRetry =
        typeof config.shouldRetryOnError === 'function'
          ? config.shouldRetryOnError(error)
          : config.shouldRetryOnError !== false;
      if (!shouldRetry) {
        return;
      }

      // Exponential backoff: 1s, 2s, 4s, max 30s
      const maxRetries = config.errorRetryCount || 3;
      if (retryCount >= maxRetries) {
        return;
      }

      const timeout = Math.min(1000 * 2 ** retryCount, 30000) + Math.random() * 1000; // Add jitter

      setTimeout(() => {
        revalidate({ retryCount });
      }, timeout);
    },

    // Keep previous data while revalidating
    keepPreviousData: true,

    // Error handling
    onError: (error, key) => {
      // Log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('SWR Error:', error, 'Key:', key);
      }
      // In production, you might want to send to error tracking service
    },

    // Success callback
    onSuccess: (data, key) => {
      // Optional: Log successful fetches in development
      if (process.env.NODE_ENV === 'development') {
        console.debug('SWR Success:', key);
      }
    },
  };

  return <SWRConfig value={config}>{children}</SWRConfig>;
};

export default SWRConfiguration;
