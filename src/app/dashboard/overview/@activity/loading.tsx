import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

export default function Loading() {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <Skeleton className='h-4 w-3/4' />
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className='flex items-center'>
              <Skeleton className='h-9 w-9 rounded-full' />
              <div className='ml-4 space-y-1'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-3 w-24' />
              </div>
              <div className='ml-auto flex flex-col items-end'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-3 w-20' />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
