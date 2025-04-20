'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/user';

// Define the context shape
interface CurrentUserContextType {
    user: User | null;
    isLoading: boolean;
    error: Error | null;
    fetchUser: () => Promise<void>;
}

// Create the context with default values
const CurrentUserContext = createContext<CurrentUserContextType>({
    user: null,
    isLoading: true,
    error: null,
    fetchUser: async () => { },
});

// Hook to use the context
export const useCurrentUser = () => useContext(CurrentUserContext);

// Provider component
export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
    const [ user, setUser ] = useState<User | null>(null);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ error, setError ] = useState<Error | null>(null);

    // Create fetch function
    const fetchUser = async () => {
        setIsLoading(true);
        try {
            // For testing, get a role from URL query param if available
            const urlParams = new URLSearchParams(window.location.search);
            const testRole = urlParams.get('testRole');

            if (testRole && [ 'admin', 'technician', 'member', 'guest' ].includes(testRole)) {
                // Create a test user with the specified role
                const testUser = {
                    id: `test-${testRole}`,
                    clerkId: `test-${testRole}`,
                    firstName: testRole.charAt(0).toUpperCase() + testRole.slice(1),
                    lastName: 'Test',
                    username: testRole,
                    email: `${testRole}@example.com`,
                    role: testRole,
                    permissions: [],
                    profileImageUrl: null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                setUser(testUser as any);
            } else {
                // Try to get the actual logged in user
                const response = await fetch('/api/users/current');
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    // Fallback to using a test admin account for demo
                    const testUser = {
                        id: 'test-admin',
                        clerkId: 'test-admin',
                        firstName: 'Admin',
                        lastName: 'User',
                        username: 'admin',
                        email: 'admin@example.com',
                        role: 'admin',
                        permissions: [],
                        profileImageUrl: null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    setUser(testUser as any);
                }
            }
        } catch (err: any) {
            console.error('Error fetching user data:', err);
            setError(err instanceof Error ? err : new Error(String(err)));

            // Fallback to using a test account
            const testUser = {
                id: 'test-admin',
                clerkId: 'test-admin',
                firstName: 'Admin',
                lastName: 'User',
                username: 'admin',
                email: 'admin@example.com',
                role: 'admin',
                permissions: [],
                profileImageUrl: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            setUser(testUser as any);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch user on mount
    useEffect(() => {
        fetchUser();
    }, []);

    // Context value
    const value = {
        user,
        isLoading,
        error,
        fetchUser
    };

    return (
        <CurrentUserContext.Provider value={value}>
            {children}
        </CurrentUserContext.Provider>
    );
} 