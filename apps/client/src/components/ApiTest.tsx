'use client';

import { useEffect, useState } from 'react';
import { HealthApi } from '@/api/generated/apis';
import type { HealthControllerCheck200Response } from '@/api/generated/models';
import { useApi } from '@/api/hooks';

export default function ApiTest() {
  const [health, setHealth] = useState<HealthControllerCheck200Response>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  // Use the new useApi hook with automatic configuration
  const healthApi = useApi(HealthApi, {
    enableLogging: true,
    enableErrorHandling: true,
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const result = await healthApi.healthControllerCheck();
        setHealth(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Health check failed:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [healthApi]);

  if (loading) {
    return <div>Loading health status...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <h3>API Health Check</h3>
      <pre>{JSON.stringify(health, null, 2)}</pre>
    </div>
  );
}
