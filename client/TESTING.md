# Testing the API Client Examples

## Quick Start

### 1. Start the API Server

First, make sure your backend API server is running:

```bash
cd apps/server
pnpm dev
```

The server should start on `http://localhost:4000`

### 2. Start the Next.js Client

In a new terminal:

```bash
cd apps/client
pnpm dev
```

The client should start on `http://localhost:3001`

### 3. Visit the Examples Page

Open your browser and navigate to:

```
http://localhost:3001/examples/api-client
```

## Testing Each Example

### ✅ Basic Usage Example

1. The example should automatically load when the page loads
2. You should see the health check status
3. Look for:
   - ⏳ Loading state initially
   - ✅ Success message with health status
   - JSON response displayed

**Expected Result:**
```json
{
  "status": "ok",
  "info": { ... },
  "details": { ... }
}
```

### ⚠️ Error Handling Example

1. Click the "🧪 Trigger API Call" button
2. Watch the console (F12 → Console tab)
3. Check the error display

**To test error scenarios:**
- Stop the API server to trigger a network error
- Click the button and see the error handling in action

### 🔄 SWR Integration Example

1. Watch the data auto-refresh every 10 seconds
2. Click "🔄 Manual Refresh" to trigger immediate refresh
3. Open DevTools Network tab to see requests
4. Switch to another tab and back to see revalidation

**Expected Behavior:**
- Data refreshes automatically
- Manual refresh works immediately
- Revalidates when you focus the tab

### 🔐 Authentication Example

1. Enter a demo token (e.g., `demo-token-123`)
2. Click "💾 Save Token"
3. Click "🔒 Make Authenticated Request"
4. Open DevTools Network tab
5. Check the request headers for `Authorization: Bearer demo-token-123`

**To verify:**
```bash
# In DevTools Network tab, click on the request
# Look for Request Headers:
Authorization: Bearer demo-token-123
```

### 🔧 Custom Middleware Example

1. Open browser console (F12)
2. Click "🚀 Make Request with Middleware"
3. Watch the console for middleware logs:
   - ⏱️ Request started
   - ⏱️ Request completed with timing
   - 📋 Request/response logs

**Expected Console Output:**
```
⏱️ Request started: http://localhost:4000/health
[API Request] { method: 'GET', url: '...', ... }
[API Response] { status: 200, ... }
⏱️ Request completed in 45ms: http://localhost:4000/health
```

### 🖥️ Server Component Example

1. This example renders on the server
2. Data is cached for 30 seconds
3. Refresh the page multiple times within 30 seconds
4. Notice the data doesn't change (cached)
5. Wait 30+ seconds and refresh to see new data

**To verify caching:**
- Check the timestamp in the response
- Refresh quickly → same timestamp (cached)
- Wait 30s → new timestamp (revalidated)

### ⚡ Server Action Example

1. Click "▶️ Run Server Action"
2. Watch the result appear
3. Check that the cache was revalidated

**Expected:**
- Action runs on server
- Result returned to client
- Cache tag 'health' is revalidated

## Troubleshooting

### Issue: "Cannot connect to API"

**Solution:**
```bash
# Check if API server is running
curl http://localhost:4000/health

# If not running, start it:
cd apps/server
pnpm dev
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Regenerate the API client
cd apps/client
pnpm openapi

# Restart the dev server
pnpm dev
```

### Issue: TypeScript errors in IDE

**Solution:**
```bash
# Restart TypeScript server in VS Code
# Command Palette (Cmd+Shift+P) → "TypeScript: Restart TS Server"

# Or restart your IDE
```

### Issue: Examples not showing

**Solution:**
```bash
# Make sure you're on the right URL
http://localhost:3001/examples/api-client

# Check browser console for errors
# Press F12 → Console tab
```

## Advanced Testing

### Test with Different API States

1. **Test Success:**
   - Keep API server running
   - All examples should work

2. **Test Network Error:**
   ```bash
   # Stop the API server
   cd apps/server
   # Press Ctrl+C
   ```
   - Error handling example should show network errors
   - Other examples should show error states

3. **Test Slow Response:**
   - Add a delay in your API endpoint
   - Watch loading states

### Test Authentication Flow

1. **With Token:**
   ```tsx
   // Save token in auth example
   Token: "my-test-token"
   ```
   - Check Network tab for Authorization header

2. **Without Token:**
   - Clear the token
   - Request should still work (no auth required for health endpoint)

### Test Caching

1. **Server Component:**
   - Note the timestamp
   - Refresh page quickly → same timestamp
   - Wait 30s → new timestamp

2. **SWR:**
   - Watch auto-refresh every 10s
   - Switch tabs to trigger revalidation

## Verification Checklist

- [ ] API server is running on port 4000
- [ ] Client is running on port 3001
- [ ] Examples page loads at `/examples/api-client`
- [ ] Basic example shows health status
- [ ] Error example can trigger errors
- [ ] SWR example auto-refreshes
- [ ] Auth example saves/loads token
- [ ] Middleware example logs to console
- [ ] Server component shows cached data
- [ ] Server action executes successfully

## Browser DevTools Tips

### Network Tab
- See all API requests
- Check request/response headers
- Verify Authorization headers
- Monitor request timing

### Console Tab
- See middleware logs
- Check for errors
- View timing information
- Debug issues

### React DevTools
- Inspect component state
- Check hook values
- Monitor re-renders

## Next Steps

Once everything works:

1. **Experiment:**
   - Modify the examples
   - Try different configurations
   - Add your own examples

2. **Copy Patterns:**
   - Use examples as templates
   - Adapt to your API endpoints
   - Build your own components

3. **Read Documentation:**
   - Check `src/api/README.md`
   - Review middleware options
   - Explore advanced features

## Quick Test Script

Run this to verify everything:

```bash
# Terminal 1: Start API server
cd apps/server && pnpm dev

# Terminal 2: Start client
cd apps/client && pnpm dev

# Terminal 3: Test API
curl http://localhost:4000/health

# Then open browser:
# http://localhost:3001/examples/api-client
```

## Success Criteria

✅ All examples load without errors
✅ API calls complete successfully  
✅ Error handling works when server is down
✅ Authentication headers are sent
✅ Middleware logs appear in console
✅ Caching works as expected
✅ Server actions execute properly

Happy testing! 🚀
