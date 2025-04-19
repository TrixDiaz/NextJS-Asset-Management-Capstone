import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher([ '/dashboard(.*)' ]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  try {
    // Protect dashboard routes
    if (isProtectedRoute(req)) await auth.protect();

    return;
  } catch (error) {
    // Just log to console in case of errors
    console.error(`Middleware error:`, error);

    // Re-throw the error to let Clerk handle it
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
