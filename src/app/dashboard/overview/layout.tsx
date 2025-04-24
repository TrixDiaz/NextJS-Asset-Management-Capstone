import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import React from 'react';
import { prisma } from '@/lib/prisma';

export default async function OverViewLayout({
  pie_stats,
  bar_stats,
  area_stats,
  activity
}: {
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
  activity: React.ReactNode;
}) {
  // Fetch dynamic data from database
  const totalUsers = await prisma.user.count();
  const totalTickets = await prisma.ticket.count();
  const openTickets = await prisma.ticket.count({
    where: { status: 'OPEN' }
  });
  const resolvedTickets = await prisma.ticket.count({
    where: { status: 'RESOLVED' }
  });

  // Calculate percentage changes (for demo purposes)
  const openTicketsPercentage =
    totalTickets > 0 ? ((openTickets / totalTickets) * 100).toFixed(1) : '0.0';
  const resolvedPercentage =
    totalTickets > 0
      ? ((resolvedTickets / totalTickets) * 100).toFixed(1)
      : '0.0';

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Hi, Welcome back 👋
          </h2>
        </div>

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Users</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {totalUsers}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  Active
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                System users <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                Total registered users
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Tickets</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {totalTickets}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  {totalTickets > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                  {totalTickets > 0 ? 'Active' : 'None'}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Support requests <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>All-time ticket count</div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Open Tickets</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {openTickets}
              </CardTitle>
              <CardAction>
                <Badge variant={openTickets > 0 ? 'outline' : 'secondary'}>
                  {openTickets > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                  {openTicketsPercentage}%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Tickets needing attention{' '}
                {openTickets > 0 ? (
                  <IconTrendingUp className='size-4' />
                ) : (
                  <IconTrendingDown className='size-4' />
                )}
              </div>
              <div className='text-muted-foreground'>
                Percentage of total tickets
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Resolved Tickets</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {resolvedTickets}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  {resolvedPercentage}%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Completed requests <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                Percentage of total tickets
              </div>
            </CardFooter>
          </Card>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4 md:col-span-3'>{activity}</div>
          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 md:col-span-3'>{pie_stats}</div>
        </div>
      </div>
    </PageContainer>
  );
}
