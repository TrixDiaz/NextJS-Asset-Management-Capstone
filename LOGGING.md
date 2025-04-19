# Logging System Documentation

This project includes a custom logging system designed to track user actions and system events. The logging system captures information about user authentication (login/logout) and resource operations (create, read, update, delete) across various resources like users, buildings, floors, rooms, and storage.

## Edge Runtime Compatibility

The logging system is fully compatible with Edge Runtime, making it ideal for:

- Middleware
- API Routes
- Server Components
- Server Actions
- Client Components

Our custom logger uses only Edge-compatible APIs, avoiding Node.js-specific features that would cause runtime errors.

## Key Components

1. **Core Logger (`src/lib/logger.ts`)**:

   - Custom lightweight logger compatible with Edge Runtime
   - Supports multiple log levels (debug, info, warn, error)
   - Defines action types (LOGIN, LOGOUT, CREATE, READ, UPDATE, DELETE)
   - Defines resource types (USER, BUILDING, FLOOR, ROOM, STORAGE)
   - Provides a unified logging interface via the `logAction` function

2. **Server-side Logger (`src/lib/server-logger.ts`)**:

   - Provides server-side logging capabilities for Next.js server components
   - Automatically retrieves the current user from Clerk authentication
   - Handles auth errors gracefully

3. **API Middleware (`src/app/api/middleware.ts`)**:

   - Generic middleware that wraps API route handlers
   - Automatically logs API requests and responses
   - Captures HTTP method, path, user info, and operation outcomes
   - Handles authentication failures gracefully

4. **Auth Components**:
   - `LoggedSignIn` - A wrapper component for Clerk's SignIn that logs logins
   - `LoggedSignOut` - A wrapper component for Clerk's SignOut that logs logouts

## Usage Examples

### Logging Server-side Actions

```typescript
import { logServerAction, LogAction, LogResource } from '@/lib/server-logger';

// In a server component or API route
await logServerAction({
  action: LogAction.READ,
  resource: LogResource.BUILDING,
  message: 'Retrieved building details',
  details: { buildingId: '123' }
});
```

### Logging Client-side Actions

```typescript
import { logAction, LogAction, LogResource } from '@/lib/logger';

// In a client component
logAction({
  user: user.id, // Get this from useUser() hook or auth context
  action: LogAction.UPDATE,
  resource: LogResource.ROOM,
  message: 'Updated room name',
  details: { roomId: '456', newName: 'Conference Room A' }
});
```

### Using the API Middleware

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { apiMiddleware } from '../middleware';
import { LogResource } from '@/lib/logger';

// Original handler
async function handlePOST(req: NextRequest) {
  // Your implementation
}

// Export with middleware
export function POST(req: NextRequest) {
  return apiMiddleware(req, handlePOST, { resource: LogResource.FLOOR });
}
```

## Log Format

The logs are written in the following format:

```
YYYY-MM-DD HH:mm:ss [LEVEL] [dashboard-app] message {"user":"user_id","action":"action","resource":"resource","details":{...}}
```

## Log Storage

All logs are written to the console. If you need persistent log storage:

- For production use, consider using an external logging service (like Datadog, LogDNA, or Papertrail)
- Forward logs from your hosting environment to your preferred log management solution
- Add Application Monitoring (APM) for more comprehensive tracking

## Environment Variables

- `LOG_LEVEL`: Set the logging level (default: 'info')
