'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <AlertTriangle className='h-5 w-5 text-yellow-600' />
          Error Loading Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-muted-foreground text-sm'>
          There was a problem loading the recent activity data.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={reset} variant='outline' size='sm'>
          Try Again
        </Button>
      </CardFooter>
    </Card>
  );
}
