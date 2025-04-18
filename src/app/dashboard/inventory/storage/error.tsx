'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ErrorStorageInventory({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Storage inventory error:', error);

        // Show error notification
        toast('Failed to load inventory', {
            description: error.message || 'An unexpected error occurred',
        });
    }, [ error ]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Storage Inventory</h1>
                <Link href="/dashboard/inventory">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
            <div className="bg-red-50 border border-red-300 p-8 rounded-lg text-center">
                <h3 className="text-xl font-semibold text-red-800 mb-2">There was a problem</h3>
                <p className="text-red-700 mb-6">
                    There was an error loading the storage inventory. Please ensure the database is properly configured.
                </p>
                <p className="text-sm text-red-500 mb-6">
                    Error details: {error.message || String(error)}
                </p>
                <div className="flex gap-4 justify-center">
                    <Button onClick={() => reset()} variant="default">
                        Try again
                    </Button>
                    <Link href="/dashboard/inventory">
                        <Button variant="outline">
                            Return to Inventory Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
} 