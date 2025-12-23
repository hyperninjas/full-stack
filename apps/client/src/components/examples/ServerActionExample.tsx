/**
 * Server Action Example
 *
 * Demonstrates how to use the API client in Server Actions
 * with cache revalidation.
 */

'use client';

import { useState } from 'react';
import { checkHealthAction } from './actions';

export default function ServerActionExample() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleAction = async () => {
    try {
      setLoading(true);
      setError(undefined);
      const data = await checkHealthAction();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>⚡ Server Action</h3>
      <p>Using API client in Server Actions with cache revalidation</p>

      <button
        onClick={handleAction}
        disabled={loading}
        style={{
          padding: '10px 20px',
          background: '#6f42c1',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '⏳ Executing...' : '▶️ Run Server Action'}
      </button>

      {error && (
        <div style={{ marginTop: '15px', color: 'red', padding: '10px', background: '#fee' }}>
          ❌ Error: {error}
        </div>
      )}

      {result && (
        <div
          style={{ marginTop: '15px', background: '#efe', padding: '10px', borderRadius: '4px' }}
        >
          <strong>✅ Result:</strong>
          <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
            Cache revalidated with tag: <code>health</code>
          </div>
          <pre style={{ fontSize: '12px', overflow: 'auto', marginTop: '10px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <strong>Features:</strong>
        <ul style={{ margin: '10px 0' }}>
          <li>✅ Runs on the server</li>
          <li>✅ Can mutate data</li>
          <li>✅ Revalidates cache automatically</li>
          <li>✅ Type-safe with TypeScript</li>
          <li>✅ Progressive enhancement</li>
        </ul>

        <strong>Code:</strong>
        <pre
          style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}
        >
          {`async function checkHealthAction() {
  'use server';
  
  const healthApi = await createServerApi(HealthApi);
  const health = await healthApi.healthControllerCheck();
  
  // Revalidate the cache
  revalidateApiCache('health');
  
  return health;
}`}
        </pre>
      </div>
    </div>
  );
}
