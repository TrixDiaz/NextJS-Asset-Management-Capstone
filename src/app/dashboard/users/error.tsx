'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function UsersError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error
    console.error('Users page error:', error);

    // Show error notification
    toast('Failed to load users', {
      description: error.message || 'An unexpected error occurred'
    });
  }, [error]);

  return (
    <div className='p-6'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>User Management</h1>
        <Link href='/dashboard'>
          <Button variant='outline'>Back to Dashboard</Button>
        </Link>
      </div>
      <div className='rounded-lg border border-red-300 bg-red-50 p-8 text-center'>
        <h3 className='mb-2 text-xl font-semibold text-red-800'>
          There was a problem
        </h3>
        <p className='mb-6 text-red-700'>
          There was an error loading the users. Please ensure the database is
          properly configured.
        </p>
        <p className='mb-6 text-sm text-red-500'>
          Error details: {error.message || String(error)}
        </p>
        <div className='flex justify-center gap-4'>
          <Button onClick={() => reset()} variant='default'>
            Try again
          </Button>
          <Link href='/dashboard'>
            <Button variant='outline'>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
