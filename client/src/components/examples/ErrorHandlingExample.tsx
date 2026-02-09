/**
 * Error Handling Example
 *
 * Demonstrates comprehensive error handling with the ApiError class
 * and different error scenarios.
 */

'use client';

import { useState } from 'react';
import { useApi, ApiError } from '@/api';
import { HealthApi } from '@/api';

export default function ErrorHandlingExample() {
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<any>(null);

  const healthApi = useApi(HealthApi, {
    enableErrorHandling: true,
    enableLogging: true,
  });

  const triggerError = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorDetails(null);

      // This will fail if the server is not running
      await healthApi.healthControllerCheck();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);

        // Get additional error details
        const details: Record<string, any> = {
          status: err.status,
          statusText: err.statusText,
          url: err.url,
          isClientError: err.isClientError(),
          isServerError: err.isServerError(),
          is404: err.is(404),
          is500: err.is(500),
        };

        // Try to get response body
        const body = await err.getResponseJson();
        if (body) {
          details.body = body;
        }

        setErrorDetails(details);
      } else {
        console.error('Non-API error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>⚠️ Error Handling</h3>
      <p>Demonstrates comprehensive error handling with ApiError class</p>

      <button
        onClick={triggerError}
        disabled={loading}
        style={{
          padding: '10px 20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '⏳ Testing...' : '🧪 Trigger API Call'}
      </button>

      {error && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ color: 'red', padding: '10px', background: '#fee', borderRadius: '4px' }}>
            <strong>❌ Error Caught:</strong> {error.message}
          </div>

          {errorDetails && (
            <div
              style={{
                marginTop: '10px',
                background: '#f5f5f5',
                padding: '10px',
                borderRadius: '4px',
              }}
            >
              <strong>Error Details:</strong>
              <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                {JSON.stringify(errorDetails, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <strong>Features:</strong>
        <ul style={{ margin: '10px 0' }}>
          <li>
            ✅ Type-safe error handling with <code>ApiError</code>
          </li>
          <li>
            ✅ Check error types: <code>isClientError()</code>, <code>isServerError()</code>
          </li>
          <li>
            ✅ Check specific status: <code>is(404)</code>
          </li>
          <li>
            ✅ Get response body: <code>getResponseJson()</code>
          </li>
        </ul>

        <strong>Code:</strong>
        <pre
          style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}
        >
          {`try {
  await healthApi.healthControllerCheck();
} catch (err) {
  if (err instanceof ApiError) {
    if (err.is(404)) {
      // Handle not found
    } else if (err.isServerError()) {
      // Handle server error
    }
    const body = await err.getResponseJson();
  }
}`}
        </pre>
      </div>
    </div>
  );
}
