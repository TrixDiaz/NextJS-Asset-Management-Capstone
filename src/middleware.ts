import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Protect both dashboard and API routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/tickets(.*)',
  '/api/users(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  try {
    // Get the current path
    const path = new URL(req.url).pathname;

    // Check if it's an API route
    const isApiRoute = path.startsWith('/api/');

    // Special handling for dashboard routes - redirect to landing page if not authenticated
    if (path.startsWith('/dashboard')) {
      const { userId } = await auth();

      if (!userId) {
        // Redirect to landing/home page instead of sign-in
        const landingUrl = new URL('/', req.url);
        return NextResponse.redirect(landingUrl);
      }
    }

    // Protect routes
    if (isProtectedRoute(req)) {
      auth.protect();

      // Log authentication state for debugging
      console.log(`Protected route access: ${path}`);
    }

    return NextResponse.next();
  } catch (error) {
    // Log error details
    console.error(`Middleware auth error for ${req.url}:`, error);

    // For API routes, return a JSON error instead of redirecting
    if (req.url.includes('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // For dashboard routes, redirect to landing page
    if (req.url.includes('/dashboard/')) {
      const landingUrl = new URL('/', req.url);
      return NextResponse.redirect(landingUrl);
    }

    // Otherwise, let Clerk handle it
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
