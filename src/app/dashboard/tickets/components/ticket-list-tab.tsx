'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, Loader2, CalendarRange, Computer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface TicketListTabProps {
  filter: {
    status: string | null;
    type: string | null;
  };
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  ticketType: string;
  createdAt: string;
  roomId: string | null;
  room?: {
    number: string;
    floor: {
      number: number;
      building: {
        name: string;
      };
    };
  };
  startTime?: string;
  endTime?: string;
  dayOfWeek?: string;
  requestedAssetId?: string;
  requestedAsset?: {
    id: string;
    assetTag?: string;
    assetType: string;
  };
}

export default function TicketListTab({ filter }: TicketListTabProps) {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        let url = '/api/tickets';
        const params = new URLSearchParams();

        if (filter.status) {
          params.append('status', filter.status);
        }

        if (filter.type) {
          params.append('ticketType', filter.type);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        console.log(`Fetching tickets from: ${url}`);
        const response = await fetch(url, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: 'Unknown error' }));
          console.error('Ticket API error:', {
            status: response.status,
            data: errorData
          });

          if (response.status === 401) {
            throw new Error('You need to sign in to view tickets');
          } else if (response.status === 403) {
            throw new Error("You don't have permission to view these tickets");
          } else {
            throw new Error(
              errorData.error ||
                `Failed to fetch tickets: ${response.statusText}`
            );
          }
        }

        const data = await response.json();
        console.log(`Received ${data.length} tickets`);
        setTickets(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to fetch tickets'
        );
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to fetch tickets',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [filter]);

  if (loading) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <Loader2 className='text-primary h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <div className='text-center'>
          <h3 className='text-lg font-semibold text-red-500'>Error</h3>
          <p>{error}</p>
          <Button
            variant='outline'
            onClick={() => router.refresh()}
            className='mt-4'
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className='flex h-40 items-center justify-center rounded-lg border'>
        <div className='text-center'>
          <h3 className='text-lg font-semibold'>No tickets found</h3>
          <p className='text-muted-foreground'>
            {filter.type
              ? `No ${filter.type.toLowerCase().replace('_', ' ')} tickets found.`
              : 'No tickets match the current filters.'}
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-500';
      case 'IN_PROGRESS':
        return 'bg-yellow-500';
      case 'RESOLVED':
        return 'bg-green-500';
      case 'CLOSED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-green-500';
      case 'MEDIUM':
        return 'bg-blue-500';
      case 'HIGH':
        return 'bg-orange-500';
      case 'CRITICAL':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTicketTypeColor = (type: string) => {
    switch (type) {
      case 'ISSUE_REPORT':
        return 'bg-purple-500';
      case 'ROOM_REQUEST':
        return 'bg-teal-500';
      case 'ASSET_REQUEST':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTicketDescription = (ticket: Ticket) => {
    if (!ticket) return '';

    switch (ticket.ticketType) {
      case 'ROOM_REQUEST':
        if (
          ticket.room &&
          ticket.dayOfWeek &&
          ticket.startTime &&
          ticket.endTime
        ) {
          try {
            const day =
              ticket.dayOfWeek.charAt(0).toUpperCase() +
              ticket.dayOfWeek.slice(1);
            const start = new Date(ticket.startTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });
            const end = new Date(ticket.endTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });

            return `Room ${ticket.room.number} (${ticket.room.floor?.building?.name || 'Unknown'}) - ${day} ${start} to ${end}`;
          } catch (error) {
            return 'Room request (detailed info unavailable)';
          }
        }
        return 'Room request';

      case 'ASSET_REQUEST':
        if (ticket.requestedAsset) {
          return `${ticket.requestedAsset.assetType || 'Asset'} ${ticket.requestedAsset.assetTag ? `(${ticket.requestedAsset.assetTag})` : ''}`;
        }
        return 'Asset request';

      default:
        if (!ticket.description) return 'No description available';
        return ticket.description.length > 100
          ? `${ticket.description.substring(0, 100)}...`
          : ticket.description;
    }
  };

  const getTicketIcon = (ticket: Ticket) => {
    switch (ticket.ticketType) {
      case 'ROOM_REQUEST':
        return <CalendarRange className='mr-1 h-4 w-4' />;
      case 'ASSET_REQUEST':
        return <Computer className='mr-1 h-4 w-4' />;
      default:
        return null;
    }
  };

  return (
    <div className='space-y-4'>
      {tickets.map((ticket) => (
        <Link
          href={`/dashboard/tickets/${ticket.id}`}
          key={ticket.id}
          className='block'
        >
          <div className='hover:bg-muted/50 rounded-lg border p-4 transition-colors'>
            <div className='mb-2 flex items-start justify-between'>
              <h3 className='text-lg font-medium'>{ticket.title}</h3>
              <div className='text-muted-foreground flex items-center space-x-1 text-sm'>
                <span>{formatDate(ticket.createdAt)}</span>
                <ArrowUpRight className='ml-1 h-4 w-4' />
              </div>
            </div>

            <div className='text-muted-foreground mb-2 flex items-center text-sm'>
              {getTicketIcon(ticket)}
              <span>{getTicketDescription(ticket)}</span>
            </div>

            <div className='mt-2 flex flex-wrap gap-2'>
              <Badge className={getStatusColor(ticket.status)}>
                {ticket.status.replace('_', ' ')}
              </Badge>
              <Badge className={getPriorityColor(ticket.priority)}>
                {ticket.priority}
              </Badge>
              <Badge className={getTicketTypeColor(ticket.ticketType)}>
                {ticket.ticketType.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
