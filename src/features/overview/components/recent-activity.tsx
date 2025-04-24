import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityProps {
  limit?: number;
}

export async function RecentActivity({ limit = 5 }: RecentActivityProps) {
  // Fetch recent tickets
  const recentTickets = await prisma.ticket.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      asset: true,
      room: true
    }
  });

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest tickets created in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {recentTickets.map((ticket) => {
            // Create avatar fallback from ticket title
            const fallback = ticket.title
              .split(' ')
              .slice(0, 2)
              .map((word) => word[0])
              .join('')
              .toUpperCase();

            // Determine the status color
            const getStatusColor = (status: string) => {
              switch (status) {
                case 'OPEN':
                  return 'text-yellow-600';
                case 'IN_PROGRESS':
                  return 'text-blue-600';
                case 'RESOLVED':
                  return 'text-green-600';
                case 'CLOSED':
                  return 'text-gray-600';
                default:
                  return 'text-gray-600';
              }
            };

            return (
              <div key={ticket.id} className='flex items-center'>
                <Avatar className='h-9 w-9'>
                  <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>
                <div className='ml-4 space-y-1'>
                  <p className='text-sm leading-none font-medium'>
                    {ticket.title}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    {ticket.room ? `Room: ${ticket.room.number}` : ''}
                    {ticket.asset
                      ? ` • Asset: ${ticket.asset.assetTag || 'Untagged'}`
                      : ''}
                  </p>
                </div>
                <div className='ml-auto flex flex-col items-end'>
                  <span
                    className={`text-sm font-medium ${getStatusColor(ticket.status)}`}
                  >
                    {ticket.status}
                  </span>
                  <span className='text-muted-foreground text-xs'>
                    {formatDistanceToNow(new Date(ticket.createdAt), {
                      addSuffix: true
                    })}
                  </span>
                </div>
              </div>
            );
          })}

          {recentTickets.length === 0 && (
            <div className='flex flex-col items-center justify-center py-6 text-center'>
              <p className='text-muted-foreground'>No recent tickets found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
