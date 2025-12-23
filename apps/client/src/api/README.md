# API Client

This directory contains the OpenAPI-generated API client and Next.js integration utilities for type-safe API communication.

## Directory Structure

```
src/api/
├── generated/          # Auto-generated OpenAPI client (do not edit manually)
│   ├── models/        # TypeScript interfaces for API models
│   ├── services/      # API service classes
│   └── runtime.ts     # Runtime utilities
├── client.ts          # API client factory and configuration
├── middleware.ts      # Request/response middleware
├── hooks.ts           # React hooks for client components
├── server.ts          # Server-side utilities
├── types.ts           # Type exports and utilities
├── index.ts           # Main entry point
└── README.md          # This file
```

## Quick Start

### Client Component Usage

```tsx
'use client';

import { useApi } from '@/api';
import { HealthApi } from '@/api/generated/services';

export function HealthCheck() {
  const healthApi = useApi(HealthApi, {
    getAccessToken: () => localStorage.getItem('token')
  });
  
  const [health, setHealth] = useState(null);
  
  useEffect(() => {
    healthApi.healthControllerCheck()
      .then(setHealth)
      .catch(console.error);
  }, [healthApi]);
  
  return <div>{JSON.stringify(health)}</div>;
}
```

### Server Component Usage

```tsx
import { createServerApi } from '@/api';
import { HealthApi } from '@/api/generated/services';

export default async function ServerHealthCheck() {
  const healthApi = await createServerApi(HealthApi, {
    tags: ['health'],
    revalidate: 60 // Revalidate every 60 seconds
  });
  
  const health = await healthApi.healthControllerCheck();
  
  return <div>{JSON.stringify(health)}</div>;
}
```

## Regenerating the API Client

When the backend API changes, regenerate the client:

```bash
# Clean old generated files and generate new ones
pnpm openapi

# Or run individually
pnpm openapi:clean
pnpm openapi:gen
```

The generator will:
1. Read the OpenAPI spec from `openapi/openapi.json`
2. Generate TypeScript code in `src/api/generated/`
3. Run Prettier and ESLint to format the code

## Configuration

### Environment Variables

Configure the API base URL in your `.env` files:

```bash
# Client-side API URL (must start with NEXT_PUBLIC_)
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# Server-side API URL (can be internal/docker network URL)
API_BASE_URL=http://localhost:4000

# API request timeout in milliseconds
API_TIMEOUT=30000
```

### Custom Configuration

Create a custom API configuration:

```ts
import { createApiConfig } from '@/api';

const config = createApiConfig({
  basePath: 'https://api.example.com',
  accessToken: 'your-token',
  headers: {
    'X-Custom-Header': 'value'
  },
  credentials: 'include'
});
```

## Client-Side Usage

### Using Hooks

The `useApi` hook is the recommended way to use the API in client components:

```tsx
'use client';

import { useApi } from '@/api';
import { UsersApi } from '@/api/generated/services';

function UserList() {
  const usersApi = useApi(UsersApi, {
    getAccessToken: () => localStorage.getItem('token'),
    enableLogging: true,
    enableErrorHandling: true
  });
  
  // Use usersApi...
}
```

### Manual Configuration

For more control, use `useApiClient`:

```tsx
'use client';

import { useApiClient } from '@/api';
import { UsersApi } from '@/api/generated/services';

function UserList() {
  const config = useApiClient({
    getAccessToken: () => localStorage.getItem('token')
  });
  
  const usersApi = useMemo(() => new UsersApi(config), [config]);
  
  // Use usersApi...
}
```

### With SWR

Integrate with SWR for data fetching:

```tsx
'use client';

import useSWR from 'swr';
import { useApi } from '@/api';
import { UsersApi } from '@/api/generated/services';

function UserList() {
  const usersApi = useApi(UsersApi);
  
  const { data, error, isLoading } = useSWR(
    'users',
    () => usersApi.getUsers()
  );
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* Render users */}</div>;
}
```

## Server-Side Usage

### In Server Components

```tsx
import { createServerApi } from '@/api';
import { UsersApi } from '@/api/generated/services';

export default async function UsersPage() {
  const usersApi = await createServerApi(UsersApi, {
    tags: ['users'],
    revalidate: 60
  });
  
  const users = await usersApi.getUsers();
  
  return <UserList users={users} />;
}
```

### In Server Actions

```tsx
'use server';

import { createServerApi, revalidateApiCache } from '@/api';
import { UsersApi } from '@/api/generated/services';

export async function createUser(formData: FormData) {
  const usersApi = await createServerApi(UsersApi);
  
  const user = await usersApi.createUser({
    createUserDto: {
      name: formData.get('name') as string,
      email: formData.get('email') as string
    }
  });
  
  // Revalidate the users cache
  revalidateApiCache('users');
  
  return user;
}
```

### In Route Handlers

```tsx
import { NextRequest } from 'next/server';
import { getServerApiConfig } from '@/api';
import { UsersApi } from '@/api/generated/services';

export async function GET(request: NextRequest) {
  const config = await getServerApiConfig({
    cache: 'no-store' // Don't cache this request
  });
  
  const usersApi = new UsersApi(config);
  const users = await usersApi.getUsers();
  
  return Response.json(users);
}
```

## Middleware

### Authentication

Automatically inject auth tokens:

```ts
import { createAuthMiddleware } from '@/api';

const authMiddleware = createAuthMiddleware(() => {
  return localStorage.getItem('token');
});
```

### Error Handling

Handle errors with custom logic:

```ts
import { createErrorHandlingMiddleware, ApiError } from '@/api';

const errorMiddleware = createErrorHandlingMiddleware();

// Catch errors
try {
  await api.someMethod();
} catch (error) {
  if (error instanceof ApiError) {
    if (error.is(401)) {
      // Handle unauthorized
    } else if (error.isServerError()) {
      // Handle server errors
    }
    
    // Get error details
    const body = await error.getResponseJson();
  }
}
```

### Retry Logic

Automatically retry failed requests:

```ts
import { createRetryMiddleware } from '@/api';

const retryMiddleware = createRetryMiddleware({
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true,
  retryableStatuses: [408, 429, 500, 502, 503, 504]
});
```

### Logging

Log requests in development:

```ts
import { createLoggingMiddleware } from '@/api';

const loggingMiddleware = createLoggingMiddleware();
```

### Combining Middleware

```ts
import { combineMiddleware, createApiConfig } from '@/api';

const config = createApiConfig({
  middleware: combineMiddleware(
    createAuthMiddleware(() => getToken()),
    createErrorHandlingMiddleware(),
    createRetryMiddleware(),
    createLoggingMiddleware()
  )
});
```

## Caching Strategies

### Static Data (ISR)

```tsx
const api = await createServerApi(UsersApi, {
  revalidate: 3600 // Revalidate every hour
});
```

### Dynamic Data

```tsx
const api = await createServerApi(UsersApi, {
  cache: 'no-store' // Always fetch fresh data
});
```

### Tagged Caching

```tsx
const api = await createServerApi(UsersApi, {
  tags: ['users', 'admin']
});

// Later, revalidate by tag
revalidateApiCache('users');
```

## Error Handling

### ApiError Class

All API errors are wrapped in the `ApiError` class:

```ts
import { ApiError } from '@/api';

try {
  await api.someMethod();
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status);        // HTTP status code
    console.log(error.statusText);    // HTTP status text
    console.log(error.url);           // Request URL
    
    // Check error type
    if (error.is(404)) {
      // Not found
    }
    
    if (error.isClientError()) {
      // 4xx error
    }
    
    if (error.isServerError()) {
      // 5xx error
    }
    
    // Get response body
    const body = await error.getResponseJson();
  }
}
```

## Type Safety

### Extract Types

```ts
import type { ApiMethodResponse, ApiMethodParams } from '@/api';
import { UsersApi } from '@/api/generated/services';

// Get the response type of a method
type User = ApiMethodResponse<UsersApi['getUser']>;

// Get the parameters type of a method
type GetUserParams = ApiMethodParams<UsersApi['getUser']>;
```

### Custom Types

```ts
import type { PaginatedResponse } from '@/api';

interface User {
  id: string;
  name: string;
}

type UserListResponse = PaginatedResponse<User>;
```

## Best Practices

1. **Use hooks in client components** - `useApi` handles memoization and configuration
2. **Use server utilities in server components** - `createServerApi` handles caching
3. **Tag your caches** - Use cache tags for granular invalidation
4. **Handle errors properly** - Use `ApiError` for type-safe error handling
5. **Don't edit generated code** - All files in `generated/` are auto-generated
6. **Use environment variables** - Configure base URLs per environment
7. **Enable logging in development** - Helps debug API issues
8. **Use retry middleware for resilience** - Handle transient failures

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors after regenerating:
1. Restart your TypeScript server
2. Run `pnpm tsc --noEmit` to check for errors
3. Make sure `src/api/generated` is not in `.gitignore`

### Import Errors

If imports fail:
1. Make sure you've run `pnpm openapi` to generate the client
2. Check that `src/api/generated` exists
3. Verify the OpenAPI spec is valid

### Runtime Errors

If you get runtime errors:
1. Check environment variables are set correctly
2. Verify the API server is running
3. Check network tab for actual request/response
4. Enable logging middleware to see request details

## Migration from Old Setup

If you're migrating from the old `api/` directory:

1. **Update imports**:
   ```ts
   // Old
   import { HealthApi } from '@/api';
   
   // New
   import { HealthApi } from '@/api/generated/services';
   ```

2. **Update configuration**:
   ```ts
   // Old
   const config = new Configuration({
     basePath: 'http://localhost:4000'
   });
   
   // New
   import { createClientConfig } from '@/api';
   const config = createClientConfig();
   ```

3. **Use new hooks**:
   ```ts
   // Old
   const api = new HealthApi(config);
   
   // New
   const api = useApi(HealthApi);
   ```

## Additional Resources

- [OpenAPI Generator Docs](https://openapi-generator.tech/)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
