'use client';

import { SignIn as ClerkSignInForm } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { LogAction, LogResource, logAction } from '@/lib/logger';
import { useCallback } from 'react';

interface LoggedSignInProps {
    initialValues?: {
        emailAddress?: string;
    };
}

export function LoggedSignIn({ initialValues }: LoggedSignInProps) {
    const router = useRouter();

    const handleSignInComplete = useCallback(() => {
        try {
            // Log the login action after successful sign-in
            logAction({
                user: 'current-user', // Will be updated in middleware/server logs
                action: LogAction.LOGIN,
                resource: LogResource.USER,
                message: 'User logged in'
            });
        } catch (error) {
            console.error('Error logging sign-in:', error);
        }
    }, []);

    return (
        <ClerkSignInForm
            initialValues={initialValues}
            signUpUrl="/auth/sign-up"
            afterSignInUrl="/dashboard/overview"
            appearance={{
                elements: {
                    formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
                },
            }}
            redirectUrl="/dashboard/overview"
            afterSignIn={handleSignInComplete}
        />
    );
} 