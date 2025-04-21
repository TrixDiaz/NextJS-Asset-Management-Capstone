import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Protect both dashboard and API routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/tickets(.*)',
  '/api/users(.*)'
]);

export default clerkMiddleware((auth, request) => {
  try {
    // Get the current path
    const path = new URL(request.url).pathname;

    // Check if it's an API route
    const isApiRoute = path.startsWith('/api/');

    // Protect routes
    if (isProtectedRoute(request)) {
      auth.protect();

      // Log authentication state for debugging
      console.log(`Protected route access: ${path}`);
    }

    return NextResponse.next();
  } catch (error) {
    // Log error details
    console.error(`Middleware auth error for ${request.url}:`, error);

    // For API routes, return a JSON error instead of redirecting
    if (request.url.includes('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Otherwise, let Clerk handle it (redirect to sign-in)
    throw error;
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
