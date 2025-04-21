'use client';

import { SignOutButton } from '@clerk/nextjs';
import { LogAction, LogResource, logAction } from '@/lib/logger';
import { useUser } from '@clerk/nextjs';
import { useCallback } from 'react';

interface LoggedSignOutProps {
  redirectUrl?: string;
  children?: React.ReactNode;
}

export function LoggedSignOut({
  redirectUrl = '/auth/sign-in',
  children
}: LoggedSignOutProps) {
  const { user } = useUser();

  // Log action before signing out
  const logSignOut = useCallback(() => {
    try {
      if (user) {
        logAction({
          user: user.id,
          action: LogAction.LOGOUT,
          resource: LogResource.USER,
          message: 'User logged out',
          details: {
            email: user.primaryEmailAddress?.emailAddress
          }
        });
      } else {
        // Log even if user object is not available
        logAction({
          user: 'unknown-user',
          action: LogAction.LOGOUT,
          resource: LogResource.USER,
          message: 'User logged out (user data unavailable)'
        });
      }
    } catch (error) {
      console.error('Error logging sign-out:', error);
    }
  }, [user]);

  return (
    <div onClick={logSignOut}>
      <SignOutButton redirectUrl={redirectUrl}>
        {children || 'Sign out'}
      </SignOutButton>
    </div>
  );
}
