import { Suspense } from 'react';
import { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TicketListTab from './components/ticket-list-tab';
import CreateTicketButton from './components/create-ticket-button';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Tickets',
  description: 'View and manage support tickets'
};

export default function TicketsPage() {
  return (
    <div className='m-6 h-[calc(100vh-50px)] overflow-y-auto'>
      <div className='container mx-auto space-y-6 py-6'>
        <div className='flex items-center justify-between'>
          <PageHeader
            heading='Tickets'
            subheading='View and manage support tickets'
          />
          <CreateTicketButton />
        </div>

        <Tabs defaultValue='all'>
          <TabsList className='grid w-full grid-cols-5 md:w-auto'>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='open'>Open</TabsTrigger>
            <TabsTrigger value='issues'>Issues</TabsTrigger>
            <TabsTrigger value='room-requests'>Room Requests</TabsTrigger>
            <TabsTrigger value='asset-requests'>Asset Requests</TabsTrigger>
          </TabsList>
          <TabsContent value='all' className='space-y-4'>
            <Suspense fallback={<TicketsSkeleton />}>
              <TicketListTab filter={{ status: null, type: null }} />
            </Suspense>
          </TabsContent>
          <TabsContent value='open' className='space-y-4'>
            <Suspense fallback={<TicketsSkeleton />}>
              <TicketListTab filter={{ status: 'OPEN', type: null }} />
            </Suspense>
          </TabsContent>
          <TabsContent value='issues' className='space-y-4'>
            <Suspense fallback={<TicketsSkeleton />}>
              <TicketListTab filter={{ status: null, type: 'ISSUE_REPORT' }} />
            </Suspense>
          </TabsContent>
          <TabsContent value='room-requests' className='space-y-4'>
            <Suspense fallback={<TicketsSkeleton />}>
              <TicketListTab filter={{ status: null, type: 'ROOM_REQUEST' }} />
            </Suspense>
          </TabsContent>
          <TabsContent value='asset-requests' className='space-y-4'>
            <Suspense fallback={<TicketsSkeleton />}>
              <TicketListTab filter={{ status: null, type: 'ASSET_REQUEST' }} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TicketsSkeleton() {
  return (
    <div className='space-y-4'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className='space-y-3 rounded-lg border p-4'>
          <div className='flex items-start justify-between'>
            <Skeleton className='h-6 w-1/3' />
            <Skeleton className='h-5 w-20' />
          </div>
          <Skeleton className='h-4 w-2/3' />
          <div className='flex space-x-2'>
            <Skeleton className='h-5 w-16' />
            <Skeleton className='h-5 w-24' />
          </div>
        </div>
      ))}
    </div>
  );
}
