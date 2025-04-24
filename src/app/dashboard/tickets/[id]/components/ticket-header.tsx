'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TicketHeaderProps {
  ticket: any;
}

export default function TicketHeader({ ticket }: TicketHeaderProps) {
  const router = useRouter();

  // Function to get badge color based on status
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

  // Function to get badge color based on priority
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

  // Function to get badge color based on ticket type
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

  return (
    <div className='flex flex-col space-y-2'>
      <div className='flex items-center justify-between'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => router.push('/dashboard/tickets')}
          className='mb-2'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Tickets
        </Button>

        <div className='flex space-x-2'>
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
      <h1 className='text-2xl font-bold'>{ticket.title}</h1>
    </div>
  );
}
