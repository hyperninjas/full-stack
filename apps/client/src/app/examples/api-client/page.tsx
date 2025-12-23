/**
 * API Client Examples Page
 *
 * Comprehensive examples demonstrating all features of the API client
 */
import { Suspense } from 'react';
import AuthenticationExample from '@/components/examples/AuthenticationExample';
import BasicUsageExample from '@/components/examples/BasicUsageExample';
import CustomMiddlewareExample from '@/components/examples/CustomMiddlewareExample';
import ErrorHandlingExample from '@/components/examples/ErrorHandlingExample';
import SWRIntegrationExample from '@/components/examples/SWRIntegrationExample';
import ServerActionExample from '@/components/examples/ServerActionExample';
import ServerComponentExample from '@/components/examples/ServerComponentExample';

export default function APIClientExamplesPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>🚀 API Client Examples</h1>
        <p style={{ fontSize: '18px', color: '#666' }}>
          Comprehensive examples demonstrating all features of the OpenAPI-generated API client
        </p>
      </header>

      <nav
        style={{
          marginBottom: '40px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '8px',
        }}
      >
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>📚 Table of Contents</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '10px',
          }}
        >
          <a href="#basic" style={{ color: '#007bff', textDecoration: 'none' }}>
            📝 Basic Usage
          </a>
          <a href="#error" style={{ color: '#007bff', textDecoration: 'none' }}>
            ⚠️ Error Handling
          </a>
          <a href="#swr" style={{ color: '#007bff', textDecoration: 'none' }}>
            🔄 SWR Integration
          </a>
          <a href="#auth" style={{ color: '#007bff', textDecoration: 'none' }}>
            🔐 Authentication
          </a>
          <a href="#server" style={{ color: '#007bff', textDecoration: 'none' }}>
            🖥️ Server Component
          </a>
          <a href="#action" style={{ color: '#007bff', textDecoration: 'none' }}>
            ⚡ Server Action
          </a>
          <a href="#middleware" style={{ color: '#007bff', textDecoration: 'none' }}>
            🔧 Custom Middleware
          </a>
        </div>
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Client-Side Examples */}
        <section>
          <h2
            style={{
              fontSize: '28px',
              marginBottom: '20px',
              borderBottom: '2px solid #007bff',
              paddingBottom: '10px',
            }}
          >
            💻 Client-Side Examples
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div id="basic">
              <BasicUsageExample />
            </div>

            <div id="error">
              <ErrorHandlingExample />
            </div>

            <div id="swr">
              <SWRIntegrationExample />
            </div>

            <div id="auth">
              <AuthenticationExample />
            </div>

            <div id="middleware">
              <CustomMiddlewareExample />
            </div>
          </div>
        </section>

        {/* Server-Side Examples */}
        <section>
          <h2
            style={{
              fontSize: '28px',
              marginBottom: '20px',
              borderBottom: '2px solid #28a745',
              paddingBottom: '10px',
            }}
          >
            🖥️ Server-Side Examples
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div id="server">
              <Suspense
                fallback={<div style={{ padding: '20px' }}>Loading server component...</div>}
              >
                <ServerComponentExample />
              </Suspense>
            </div>

            <div id="action">
              <ServerActionExample />
            </div>
          </div>
        </section>

        {/* Additional Resources */}
        <section
          style={{
            marginTop: '40px',
            padding: '30px',
            background: '#e7f3ff',
            borderRadius: '8px',
            border: '2px solid #007bff',
          }}
        >
          <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>📖 Additional Resources</h2>

          <ul style={{ fontSize: '16px', lineHeight: '1.8' }}>
            <li>
              <strong>API Client Documentation:</strong> <code>src/api/README.md</code> -
              Comprehensive guide to all features
            </li>
            <li>
              <strong>Generated API:</strong> <code>src/api/generated/</code> - Auto-generated
              TypeScript client
            </li>
            <li>
              <strong>Regenerate Client:</strong> Run <code>pnpm openapi</code> to regenerate from
              OpenAPI spec
            </li>
            <li>
              <strong>Environment Setup:</strong> Configure <code>NEXT_PUBLIC_API_BASE_URL</code> in{' '}
              <code>.env</code>
            </li>
          </ul>
        </section>

        {/* Features Overview */}
        <section
          style={{
            marginTop: '20px',
            padding: '30px',
            background: '#f8f9fa',
            borderRadius: '8px',
          }}
        >
          <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>✨ Key Features</h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>🎯 Type Safety</h3>
              <ul style={{ fontSize: '14px', color: '#666' }}>
                <li>Full TypeScript support</li>
                <li>Auto-generated types from OpenAPI</li>
                <li>Type-safe API methods</li>
                <li>Custom error types</li>
              </ul>
            </div>

            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>⚡ Performance</h3>
              <ul style={{ fontSize: '14px', color: '#666' }}>
                <li>Next.js caching support</li>
                <li>SWR integration</li>
                <li>Request deduplication</li>
                <li>Automatic revalidation</li>
              </ul>
            </div>

            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>🔧 Flexibility</h3>
              <ul style={{ fontSize: '14px', color: '#666' }}>
                <li>Custom middleware</li>
                <li>Error handling</li>
                <li>Retry logic</li>
                <li>Request/response interceptors</li>
              </ul>
            </div>

            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>🚀 Developer Experience</h3>
              <ul style={{ fontSize: '14px', color: '#666' }}>
                <li>Simple hooks API</li>
                <li>Environment-aware config</li>
                <li>Comprehensive docs</li>
                <li>Clear error messages</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <footer
        style={{
          marginTop: '60px',
          paddingTop: '30px',
          borderTop: '1px solid #ddd',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px',
        }}
      >
        <p>
          These examples demonstrate the OpenAPI-generated API client for Next.js.
          <br />
          For more information, see the{' '}
          <a href="/api/README.md" style={{ color: '#007bff' }}>
            API Client Documentation
          </a>
        </p>
      </footer>
    </div>
  );
}
