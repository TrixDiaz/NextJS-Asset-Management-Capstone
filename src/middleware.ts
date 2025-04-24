import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Create a matcher for the routes we want to protect
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/tickets(.*)',
  '/api/users(.*)'
]);

// Define public routes that don't require authentication
const publicPaths = [
  '/',
  '/api/ping',
  '/api/attendance(.*)', // Make all attendance endpoints public
  '/api/attendance/repair', // Allow access to attendance repair endpoint
  '/api/schedules(.*)', // Make schedules endpoints public for attendance form
  '/dashboard/attendance', // Make attendance form page accessible without auth
  '/attendance', // Standalone attendance page
  '/sign-in',
  '/sign-up',
  '/api/webhooks(.*)'
];

const isPublicPath = createRouteMatcher(publicPaths);

export default clerkMiddleware((auth, req) => {
  // If it's a public path, allow access without authentication
  if (isPublicPath(req)) {
    return;
  }

  // For protected routes, require authentication
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)']
};
