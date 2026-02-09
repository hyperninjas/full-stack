/**
 * SWR Integration Example
 *
 * Demonstrates how to integrate the API client with SWR for
 * automatic caching, revalidation, and optimistic updates.
 */

'use client';

import useSWR from 'swr';
import { useApi } from '@/api';
import { HealthApi } from '@/api';
import type { HealthControllerCheck200Response } from '@/api';

export default function SWRIntegrationExample() {
  const healthApi = useApi(HealthApi);

  // Use SWR with the API client
  const { data, error, isLoading, mutate } = useSWR<HealthControllerCheck200Response>(
    'health-check', // Cache key
    () => healthApi.healthControllerCheck(), // Fetcher function
    {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const handleRefresh = () => {
    mutate(); // Manually trigger revalidation
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>🔄 SWR Integration</h3>
      <p>Automatic caching and revalidation with SWR</p>

      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? '⏳ Refreshing...' : '🔄 Manual Refresh'}
        </button>
      </div>

      {isLoading && !data && <div>⏳ Loading...</div>}

      {error && (
        <div style={{ color: 'red', padding: '10px', background: '#fee' }}>
          ❌ Error: {error.message}
        </div>
      )}

      {data && (
        <div style={{ background: '#efe', padding: '10px', borderRadius: '4px' }}>
          <strong>✅ Status:</strong> {data.status}
          <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
            Auto-refreshes every 10 seconds
          </div>
          <pre style={{ fontSize: '12px', overflow: 'auto', marginTop: '10px' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <strong>Features:</strong>
        <ul style={{ margin: '10px 0' }}>
          <li>✅ Automatic caching</li>
          <li>✅ Auto-refresh every 10 seconds</li>
          <li>✅ Revalidate on focus</li>
          <li>✅ Revalidate on reconnect</li>
          <li>
            ✅ Manual refresh with <code>mutate()</code>
          </li>
        </ul>

        <strong>Code:</strong>
        <pre
          style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}
        >
          {`const healthApi = useApi(HealthApi);

const { data, error, mutate } = useSWR(
  'health-check',
  () => healthApi.healthControllerCheck(),
  {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  }
);`}
        </pre>
      </div>
    </div>
  );
}
