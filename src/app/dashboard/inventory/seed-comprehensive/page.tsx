'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState } from 'react';
import { Loader2, Database, Check, AlertCircle } from 'lucide-react';

export default function ComprehensiveSeedPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    results?: any;
    error?: string;
    details?: string;
  } | null>(null);

  const handleSeed = async () => {
    try {
      setIsLoading(true);
      setResult(null);

      const response = await fetch('/api/seed-comprehensive');
      const data = await response.json();

      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Error seeding data',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='container mx-auto py-10'>
      <h1 className='mb-6 text-3xl font-bold'>Comprehensive Database Seed</h1>

      <Card>
        <CardHeader>
          <CardTitle>Generate Demo Data</CardTitle>
          <CardDescription>
            This will create extensive sample data for: Buildings, Floors,
            Rooms, Assets, Storage Items, Deployment Records, and Schedules.
            This operation might take some time to complete.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className='space-y-4'>
            <p className='text-muted-foreground text-sm'>This will generate:</p>

            <ul className='list-disc space-y-1 pl-5 text-sm'>
              <li>Multiple users with different roles</li>
              <li>3 buildings with multiple floors</li>
              <li>Multiple rooms of different types on each floor</li>
              <li>20-30 storage items with various categories</li>
              <li>Assets deployed in rooms</li>
              <li>Deployment and maintenance records</li>
              <li>Class schedules for rooms</li>
            </ul>

            {result && (
              <Alert
                variant={result.success ? 'default' : 'destructive'}
                className='mt-4'
              >
                <div className='flex items-center gap-2'>
                  {result.success ? (
                    <Check className='h-4 w-4' />
                  ) : (
                    <AlertCircle className='h-4 w-4' />
                  )}
                  <AlertTitle>
                    {result.success ? 'Success' : 'Error'}
                  </AlertTitle>
                </div>
                <AlertDescription>
                  {result.message}
                  {result.error && (
                    <div className='mt-2 text-sm'>{result.error}</div>
                  )}
                  {result.details && (
                    <div className='mt-2 text-sm'>{result.details}</div>
                  )}

                  {result.success && result.results && (
                    <div className='mt-3 overflow-hidden'>
                      <h4 className='mb-1 font-semibold'>Created records:</h4>
                      <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3'>
                        {Object.entries(result.results.created).map(
                          ([key, value]) => (
                            <div key={key} className='flex justify-between'>
                              <span className='capitalize'>{key}:</span>
                              <span className='font-medium'>
                                {value as number}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button onClick={handleSeed} disabled={isLoading} className='w-full'>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Generating Data...
              </>
            ) : (
              <>
                <Database className='mr-2 h-4 w-4' />
                Generate Comprehensive Data
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
