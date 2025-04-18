'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function UsersError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error
        console.error('Users page error:', error);

        // Show error notification
        toast('Failed to load users', {
            description: error.message || 'An unexpected error occurred',
        });
    }, [ error ]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">User Management</h1>
                <Link href="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
            <div className="bg-red-50 border border-red-300 p-8 rounded-lg text-center">
                <h3 className="text-xl font-semibold text-red-800 mb-2">There was a problem</h3>
                <p className="text-red-700 mb-6">
                    There was an error loading the users. Please ensure the database is properly configured.
                </p>
                <p className="text-sm text-red-500 mb-6">
                    Error details: {error.message || String(error)}
                </p>
                <div className="flex gap-4 justify-center">
                    <Button onClick={() => reset()} variant="default">
                        Try again
                    </Button>
                    <Link href="/dashboard">
                        <Button variant="outline">
                            Return to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
} 