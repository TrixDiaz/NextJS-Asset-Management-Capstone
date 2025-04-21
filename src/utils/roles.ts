import { auth } from '@clerk/nextjs/server';

// Define the role types
export type Roles = 'admin' | 'moderator' | 'member';

/**
 * Checks if the current user has the specified role
 * This function must be used in a server context
 */
export const checkRole = async (role: Roles): Promise<boolean> => {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === role;
};
