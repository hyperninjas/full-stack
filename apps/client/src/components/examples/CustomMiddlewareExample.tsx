/**
 * Custom Middleware Example
 *
 * Demonstrates how to create and use custom middleware
 * for advanced request/response handling.
 */

'use client';

import { useState } from 'react';
import { useApiClient, combineMiddleware, createLoggingMiddleware } from '@/api';
import { HealthApi } from '@/api';
import type { Middleware, RequestContext, ResponseContext } from '@/api';

// Custom middleware to add request timing
const createTimingMiddleware = (): Middleware => {
  return {
    async pre(context: RequestContext) {
      // Add start time to the request
      (context.init as any).__startTime = Date.now();
      console.log('⏱️ Request started:', context.url);
      return context;
    },

    async post(context: ResponseContext) {
      // Calculate duration
      const startTime = (context.init as any).__startTime;
      const duration = Date.now() - startTime;
      console.log(`⏱️ Request completed in ${duration}ms:`, context.url);
      return context.response;
    },
  };
};

// Custom middleware to add custom headers
const createCustomHeaderMiddleware = (headers: Record<string, string>): Middleware => {
  return {
    async pre(context: RequestContext) {
      context.init.headers = {
        ...context.init.headers,
        ...headers,
      };
      return context;
    },
  };
};

export default function CustomMiddlewareExample() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timing, setTiming] = useState<number>();

  // Create API client with custom middleware
  const config = useApiClient({
    enableLogging: false, // We'll use our own logging
  });

  const makeRequest = async () => {
    try {
      setLoading(true);
      setResult(null);
      setTiming(undefined);

      const startTime = Date.now();

      // Create API with combined middleware
      const healthApi = new HealthApi(config);
      const apiWithMiddleware = healthApi.withMiddleware(
        ...combineMiddleware(
          createTimingMiddleware(),
          createCustomHeaderMiddleware({
            'X-Custom-Header': 'demo-value',
            'X-Request-ID': `req-${Date.now()}`,
          }),
          createLoggingMiddleware(),
        ),
      );

      const data = await apiWithMiddleware.healthControllerCheck();

      const duration = Date.now() - startTime;
      setTiming(duration);
      setResult(data);
    } catch (err) {
      console.error('Request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>🔧 Custom Middleware</h3>
      <p>Advanced request/response handling with custom middleware</p>

      <button
        onClick={makeRequest}
        disabled={loading}
        style={{
          padding: '10px 20px',
          background: '#fd7e14',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '⏳ Loading...' : '🚀 Make Request with Middleware'}
      </button>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        Check the browser console to see middleware logs
      </div>

      {timing !== undefined && (
        <div
          style={{ marginTop: '15px', padding: '10px', background: '#fff3cd', borderRadius: '4px' }}
        >
          <strong>⏱️ Request Duration:</strong> {timing}ms
        </div>
      )}

      {result && (
        <div
          style={{ marginTop: '15px', background: '#efe', padding: '10px', borderRadius: '4px' }}
        >
          <strong>✅ Response:</strong>
          <pre style={{ fontSize: '12px', overflow: 'auto', marginTop: '5px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <strong>Custom Middleware Created:</strong>
        <ul style={{ margin: '10px 0' }}>
          <li>
            ⏱️ <strong>Timing Middleware</strong> - Measures request duration
          </li>
          <li>
            📝 <strong>Custom Header Middleware</strong> - Adds custom headers
          </li>
          <li>
            📋 <strong>Logging Middleware</strong> - Logs requests/responses
          </li>
        </ul>

        <strong>Code:</strong>
        <pre
          style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}
        >
          {`const timingMiddleware: Middleware = {
  async pre(context) {
    context.init.__startTime = Date.now();
    return context;
  },
  async post(context) {
    const duration = Date.now() - context.init.__startTime;
    console.log(\`Request took \${duration}ms\`);
    return context.response;
  },
};

const api = healthApi.withMiddleware(
  timingMiddleware,
  customHeaderMiddleware,
  loggingMiddleware
);`}
        </pre>
      </div>
    </div>
  );
}
