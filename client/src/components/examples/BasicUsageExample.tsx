/**
 * Basic API Client Usage Example
 *
 * Demonstrates the simplest way to use the API client in a client component
 * with the useApi hook.
 */

'use client';

import { useEffect, useState } from 'react';
import { HealthApi } from '@/api/generated/apis';
import type { HealthControllerCheck200Response } from '@/api/generated/models';
import { useApi } from '@/api/hooks';

export default function BasicUsageExample() {
  const [health, setHealth] = useState<HealthControllerCheck200Response>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  // Simple usage: just pass the API class
  const healthApi = useApi(HealthApi);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        const result = await healthApi.healthControllerCheck();
        setHealth(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, [healthApi]);

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>📝 Basic API Usage</h3>
      <p>
        Simple example using the <code>useApi</code> hook
      </p>

      {loading && <div>⏳ Loading...</div>}

      {error && (
        <div style={{ color: 'red', padding: '10px', background: '#fee' }}>❌ Error: {error}</div>
      )}

      {health && (
        <div style={{ background: '#efe', padding: '10px', borderRadius: '4px' }}>
          <strong>✅ Status:</strong> {health.status}
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(health, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <strong>Code:</strong>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {`const healthApi = useApi(HealthApi);
const result = await healthApi.healthControllerCheck();`}
        </pre>
      </div>
    </div>
  );
}
