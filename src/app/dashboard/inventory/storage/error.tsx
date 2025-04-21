'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ErrorStorageInventory({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Storage inventory error:', error);

    // Show error notification
    toast('Failed to load inventory', {
      description: error.message || 'An unexpected error occurred'
    });
  }, [error]);

  return (
    <div className='p-6'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Storage Inventory</h1>
        <Link href='/dashboard/inventory'>
          <Button variant='outline'>Back to Dashboard</Button>
        </Link>
      </div>
      <div className='rounded-lg border border-red-300 bg-red-50 p-8 text-center'>
        <h3 className='mb-2 text-xl font-semibold text-red-800'>
          There was a problem
        </h3>
        <p className='mb-6 text-red-700'>
          There was an error loading the storage inventory. Please ensure the
          database is properly configured.
        </p>
        <p className='mb-6 text-sm text-red-500'>
          Error details: {error.message || String(error)}
        </p>
        <div className='flex justify-center gap-4'>
          <Button onClick={() => reset()} variant='default'>
            Try again
          </Button>
          <Link href='/dashboard/inventory'>
            <Button variant='outline'>Return to Inventory Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
