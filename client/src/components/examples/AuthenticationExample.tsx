/**
 * Authentication Example
 *
 * Demonstrates how to use the API client with authentication tokens.
 */

'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/api';
import { HealthApi } from '@/api';
import type { HealthControllerCheck200Response } from '@/api';

export default function AuthenticationExample() {
  const [token, setToken] = useState<string>('');
  const [storedToken, setStoredToken] = useState<string>('');
  const [health, setHealth] = useState<HealthControllerCheck200Response>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('demo_token');
    if (savedToken) {
      setStoredToken(savedToken);
    }
  }, []);

  // Create API client with authentication
  const healthApi = useApi(HealthApi, {
    getAccessToken: () => {
      // In a real app, this would get the token from your auth system
      return localStorage.getItem('demo_token');
    },
    enableLogging: true,
  });

  const saveToken = () => {
    localStorage.setItem('demo_token', token);
    setStoredToken(token);
  };

  const clearToken = () => {
    localStorage.removeItem('demo_token');
    setStoredToken('');
    setToken('');
  };

  const makeAuthenticatedRequest = async () => {
    try {
      setLoading(true);
      setError(undefined);
      const result = await healthApi.healthControllerCheck();
      setHealth(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>🔐 Authentication</h3>
      <p>Using the API client with authentication tokens</p>

      <div style={{ marginBottom: '15px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Demo Token:
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter a demo token..."
            style={{
              padding: '8px',
              width: '100%',
              maxWidth: '400px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={saveToken}
            disabled={!token}
            style={{
              padding: '8px 16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: token ? 'pointer' : 'not-allowed',
            }}
          >
            💾 Save Token
          </button>

          <button
            onClick={clearToken}
            disabled={!storedToken}
            style={{
              padding: '8px 16px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: storedToken ? 'pointer' : 'not-allowed',
            }}
          >
            🗑️ Clear Token
          </button>
        </div>

        {storedToken && (
          <div
            style={{
              marginTop: '10px',
              padding: '8px',
              background: '#e7f3ff',
              borderRadius: '4px',
            }}
          >
            <strong>Current Token:</strong> <code>{storedToken}</code>
          </div>
        )}
      </div>

      <button
        onClick={makeAuthenticatedRequest}
        disabled={loading}
        style={{
          padding: '10px 20px',
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '⏳ Loading...' : '🔒 Make Authenticated Request'}
      </button>

      {error && (
        <div style={{ marginTop: '15px', color: 'red', padding: '10px', background: '#fee' }}>
          ❌ Error: {error}
        </div>
      )}

      {health && (
        <div
          style={{ marginTop: '15px', background: '#efe', padding: '10px', borderRadius: '4px' }}
        >
          <strong>✅ Response:</strong>
          <pre style={{ fontSize: '12px', overflow: 'auto', marginTop: '5px' }}>
            {JSON.stringify(health, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <strong>How it works:</strong>
        <ul style={{ margin: '10px 0' }}>
          <li>Token is stored in localStorage</li>
          <li>
            <code>getAccessToken</code> retrieves it automatically
          </li>
          <li>
            Token is sent as <code>Authorization: Bearer {'{token}'}</code>
          </li>
          <li>Check browser DevTools Network tab to see the header</li>
        </ul>

        <strong>Code:</strong>
        <pre
          style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}
        >
          {`const healthApi = useApi(HealthApi, {
  getAccessToken: () => {
    return localStorage.getItem('token');
  }
});

// Token is automatically included in all requests`}
        </pre>
      </div>
    </div>
  );
}
