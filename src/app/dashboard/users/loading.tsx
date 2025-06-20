import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function UsersLoading() {
  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>User Management</h1>
        <Button disabled>Add User</Button>
      </div>

      <div className='rounded-lg border'>
        <div className='flex items-center justify-between border-b p-4'>
          <div className='flex items-center space-x-2'>
            <Skeleton className='h-8 w-24' />
            <Skeleton className='h-5 w-32' />
          </div>
          <Skeleton className='h-8 w-48' />
        </div>

        <div className='p-4'>
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className='flex items-center gap-4'>
                <Skeleton className='h-5 w-5' />
                <Skeleton className='h-10 w-10 rounded-full' />
                <Skeleton className='h-5 w-40' />
                <Skeleton className='h-5 w-32' />
                <Skeleton className='h-5 w-60' />
                <Skeleton className='h-6 w-20 rounded-full' />
                <Skeleton className='h-5 w-24' />
                <Skeleton className='ml-auto h-8 w-8 rounded-md' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
