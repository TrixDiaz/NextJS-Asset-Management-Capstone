import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import TicketDetailView from './components/ticket-detail-view';
import TicketCommentsTab from './components/ticket-comments-tab';
import TicketAttachmentsTab from './components/ticket-attachments-tab';
import TicketBreadcrumb from './components/ticket-breadcrumb';

interface TicketDetailPageProps {
  params: {
    id: string;
  };
}

export default function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = params;

  return (
    <div className='flex h-[calc(100vh-100px)] flex-col gap-4 overflow-y-auto p-6'>
      <div className='flex flex-col items-start justify-between gap-2 md:flex-row md:items-center'>
        <TicketBreadcrumb ticketId={id} />
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='md:col-span-2'>
          <Suspense fallback={<DetailSkeleton />}>
            <TicketDetailView id={id} />
          </Suspense>
        </div>

        <div className='md:col-span-1'>
          <Tabs defaultValue='comments' className='w-full'>
            <TabsList className='w-full'>
              <TabsTrigger value='comments' className='flex-1'>
                Comments
              </TabsTrigger>
              <TabsTrigger value='attachments' className='flex-1'>
                Attachments
              </TabsTrigger>
            </TabsList>
            <TabsContent value='comments' className='mt-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<CommentSkeleton />}>
                    <TicketCommentsTab ticketId={id} />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value='attachments' className='mt-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<AttachmentSkeleton />}>
                    <TicketAttachmentsTab ticketId={id} />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-3/4' />
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-20 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-32' />
          <div className='flex gap-2'>
            <Skeleton className='h-8 w-24' />
            <Skeleton className='h-8 w-24' />
          </div>
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-12 w-full' />
        </div>
      </CardContent>
    </Card>
  );
}

function CommentSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Skeleton className='h-8 w-full' />
        <div className='space-y-1'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className='h-4 w-full' />
          ))}
        </div>
      </div>
      <Skeleton className='h-20 w-full' />
    </div>
  );
}

function AttachmentSkeleton() {
  return (
    <div className='space-y-2'>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className='h-12 w-full' />
      ))}
    </div>
  );
}
