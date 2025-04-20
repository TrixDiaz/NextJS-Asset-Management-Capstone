'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { User } from '@/types/user';

/**
 * Hook to fetch the current user with permissions
 */
export function useUser() {
    const { userId } = useAuth();
    const [ user, setUser ] = useState<User | null>(null);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ error, setError ] = useState<Error | null>(null);

    // Create fetch function outside of useEffect to avoid recreation on every render
    const fetchUser = useCallback(async () => {
        if (!userId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // Check if we're in test mode with URL parameter
            const urlParams = new URLSearchParams(window.location.search);
            const testRole = urlParams.get('testRole');

            if (testRole && [ 'admin', 'technician', 'member' ].includes(testRole)) {
                // Create a test user with the specified role
                const testUser = {
                    id: `test-${testRole}`,
                    clerkId: `test-${testRole}`,
                    firstName: testRole.charAt(0).toUpperCase() + testRole.slice(1),
                    lastName: 'Test',
                    username: testRole,
                    email: `${testRole}@example.com`,
                    role: testRole as any,
                    permissions: [],
                    profileImageUrl: null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                setUser(testUser as User);
            } else {
                // Normal user fetch
                const response = await fetch(`/api/users/${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const userData = await response.json();
                setUser(userData);
            }
        } catch (err: any) {
            console.error('Error fetching user data:', err);
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setIsLoading(false);
        }
    }, [ userId ]); // Only recreate when userId changes

    useEffect(() => {
        fetchUser();
    }, [ fetchUser ]);

    return { user, isLoading, error };
} 