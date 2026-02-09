/**
 * Server Component Example
 *
 * Demonstrates how to use the API client in Next.js Server Components
 * with caching and revalidation.
 */
import { HealthApi } from '@/api';
import { createServerApi } from '@/api/server';

export default async function ServerComponentExample() {
  // Create API client for server-side with caching
  const healthApi = await createServerApi(HealthApi, {
    tags: ['health'], // Cache tag for revalidation
    revalidate: 30, // Revalidate every 30 seconds
  });

  let health;
  let error;

  try {
    health = await healthApi.healthControllerCheck();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>🖥️ Server Component</h3>
      <p>Data fetched on the server with Next.js caching</p>

      {error && (
        <div style={{ color: 'red', padding: '10px', background: '#fee' }}>❌ Error: {error}</div>
      )}

      {health && (
        <div style={{ background: '#efe', padding: '10px', borderRadius: '4px' }}>
          <strong>✅ Status:</strong> {health.status}
          <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
            Cached for 30 seconds • Tag: <code>health</code>
          </div>
          <pre style={{ fontSize: '12px', overflow: 'auto', marginTop: '10px' }}>
            {JSON.stringify(health, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <strong>Features:</strong>
        <ul style={{ margin: '10px 0' }}>
          <li>✅ Server-side rendering</li>
          <li>✅ Automatic caching with Next.js</li>
          <li>✅ Revalidates every 30 seconds</li>
          <li>✅ Can be revalidated by tag</li>
          <li>✅ No client-side JavaScript needed</li>
        </ul>

        <strong>Code:</strong>
        <pre
          style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}
        >
          {`// This is a Server Component (no 'use client')
const healthApi = await createServerApi(HealthApi, {
  tags: ['health'],
  revalidate: 30,
});

const health = await healthApi.healthControllerCheck();`}
        </pre>
      </div>
    </div>
  );
}
