/**
 * API Client Examples - README
 * 
 * This directory contains comprehensive examples demonstrating
 * all features of the OpenAPI-generated API client.
 */

# API Client Examples

This directory contains interactive examples demonstrating all features of the API client.

## 🎯 Purpose

These examples serve as:
- **Learning Resource** - Understand how to use the API client
- **Reference Implementation** - Copy-paste patterns for your own code
- **Testing Ground** - Experiment with different configurations
- **Documentation** - Live examples of all features

## 📁 Structure

```
examples/
├── BasicUsageExample.tsx          # Simple useApi hook usage
├── ErrorHandlingExample.tsx       # ApiError class and error handling
├── SWRIntegrationExample.tsx      # Integration with SWR
├── AuthenticationExample.tsx      # Token-based authentication
├── ServerComponentExample.tsx     # Server Component with caching
├── ServerActionExample.tsx        # Server Actions with revalidation
├── CustomMiddlewareExample.tsx    # Custom middleware creation
└── README.md                      # This file
```

## 🚀 Running the Examples

1. **Start the development server:**
   ```bash
   pnpm dev
   ```

2. **Navigate to the examples page:**
   ```
   http://localhost:3001/examples/api-client
   ```

3. **Make sure the API server is running:**
   ```bash
   # In the server directory
   pnpm dev
   ```

## 📚 Examples Overview

### Client-Side Examples

#### 1. Basic Usage
**File:** `BasicUsageExample.tsx`

Demonstrates the simplest way to use the API client:
```tsx
const healthApi = useApi(HealthApi);
const result = await healthApi.healthControllerCheck();
```

**Features:**
- Simple `useApi` hook
- Loading states
- Error handling
- Type-safe responses

#### 2. Error Handling
**File:** `ErrorHandlingExample.tsx`

Shows comprehensive error handling with the `ApiError` class:
```tsx
try {
  await api.someMethod();
} catch (err) {
  if (err instanceof ApiError) {
    if (err.is(404)) { /* handle not found */ }
    const body = await err.getResponseJson();
  }
}
```

**Features:**
- `ApiError` class usage
- Status code checking
- Response body extraction
- Error type detection

#### 3. SWR Integration
**File:** `SWRIntegrationExample.tsx`

Integrates the API client with SWR for caching and revalidation:
```tsx
const { data, error, mutate } = useSWR(
  'key',
  () => healthApi.healthControllerCheck(),
  { refreshInterval: 10000 }
);
```

**Features:**
- Automatic caching
- Auto-refresh
- Manual revalidation
- Optimistic updates

#### 4. Authentication
**File:** `AuthenticationExample.tsx`

Demonstrates token-based authentication:
```tsx
const healthApi = useApi(HealthApi, {
  getAccessToken: () => localStorage.getItem('token')
});
```

**Features:**
- Token storage
- Automatic header injection
- Token refresh
- Logout handling

#### 5. Custom Middleware
**File:** `CustomMiddlewareExample.tsx`

Shows how to create and use custom middleware:
```tsx
const timingMiddleware: Middleware = {
  async pre(context) { /* before request */ },
  async post(context) { /* after response */ }
};

const api = healthApi.withMiddleware(timingMiddleware);
```

**Features:**
- Custom middleware creation
- Request/response interception
- Timing measurement
- Custom headers

### Server-Side Examples

#### 6. Server Component
**File:** `ServerComponentExample.tsx`

Uses the API client in a Server Component:
```tsx
const healthApi = await createServerApi(HealthApi, {
  tags: ['health'],
  revalidate: 30
});
```

**Features:**
- Server-side rendering
- Next.js caching
- Cache tags
- Revalidation

#### 7. Server Action
**File:** `ServerActionExample.tsx`

Uses the API client in Server Actions:
```tsx
async function action() {
  'use server';
  const api = await createServerApi(HealthApi);
  const result = await api.someMethod();
  revalidateApiCache('tag');
}
```

**Features:**
- Server-side mutations
- Cache revalidation
- Progressive enhancement
- Type safety

## 🎨 Customization

Feel free to modify these examples to:
- Test different API endpoints
- Experiment with configurations
- Add your own middleware
- Try different caching strategies

## 📖 Additional Resources

- **Main API Docs:** `src/api/README.md`
- **Generated Client:** `src/api/generated/`
- **Middleware:** `src/api/middleware.ts`
- **Hooks:** `src/api/hooks.ts`
- **Server Utils:** `src/api/server.ts`

## 🐛 Troubleshooting

### Examples not working?

1. **Check API server is running:**
   ```bash
   curl http://localhost:4000/health
   ```

2. **Check environment variables:**
   ```bash
   # .env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
   ```

3. **Regenerate API client:**
   ```bash
   pnpm openapi
   ```

4. **Check browser console:**
   - Look for network errors
   - Check middleware logs
   - Verify request headers

### Common Issues

- **CORS errors:** Make sure the API server allows requests from `localhost:3001`
- **404 errors:** Verify the API endpoint exists in the OpenAPI spec
- **Type errors:** Regenerate the client after API changes
- **Auth errors:** Check token is being sent in headers

## 💡 Tips

1. **Use the browser DevTools:**
   - Network tab shows actual requests
   - Console shows middleware logs
   - React DevTools shows component state

2. **Start simple:**
   - Begin with BasicUsageExample
   - Add features incrementally
   - Test each change

3. **Read the code:**
   - Examples are heavily commented
   - Code snippets show best practices
   - Copy patterns to your own code

4. **Experiment:**
   - Modify examples to test ideas
   - Try different configurations
   - Break things to learn

## 🤝 Contributing

Found a bug or have an improvement?
- Update the example files
- Add new examples
- Improve documentation
- Share your patterns

---

Happy coding! 🚀
