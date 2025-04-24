'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { CopyIcon, CheckCircle, XCircle } from 'lucide-react';

interface TicketActionsProps {
  ticket: any;
}

export default function TicketActions({ ticket }: TicketActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(ticket.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ticket.id);
    toast({
      title: 'Copied to clipboard',
      description: 'Ticket ID has been copied to clipboard'
    });
  };

  const updateTicketStatus = async () => {
    if (status === ticket.status) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update ticket status');
      }

      toast({
        title: 'Status updated',
        description: `Ticket status has been updated to ${status.replace('_', ' ')}`
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update ticket status',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getApproveRejectButtons = () => {
    if (
      ticket.ticketType !== 'ROOM_REQUEST' &&
      ticket.ticketType !== 'ASSET_REQUEST'
    ) {
      return null;
    }

    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
      return null;
    }

    return (
      <div className='mt-4 flex flex-col space-y-2'>
        <Button
          onClick={() => {
            setStatus('RESOLVED');
            updateTicketStatus();
          }}
          className='w-full bg-green-600 hover:bg-green-700'
          disabled={isUpdating}
        >
          <CheckCircle className='mr-2 h-4 w-4' />
          Approve Request
        </Button>
        <Button
          onClick={() => {
            setStatus('CLOSED');
            updateTicketStatus();
          }}
          variant='outline'
          className='w-full border-red-500 text-red-500 hover:bg-red-50'
          disabled={isUpdating}
        >
          <XCircle className='mr-2 h-4 w-4' />
          Reject Request
        </Button>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Ticket Actions</CardTitle>
        <CardDescription>Manage this ticket</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <div className='mb-1 flex items-center justify-between'>
            <span className='text-sm font-medium'>Ticket ID</span>
            <Button
              variant='ghost'
              size='sm'
              onClick={copyToClipboard}
              className='h-6 w-6 p-0'
            >
              <CopyIcon className='h-3.5 w-3.5' />
              <span className='sr-only'>Copy ID</span>
            </Button>
          </div>
          <code className='bg-muted block w-full rounded px-2 py-1 text-xs'>
            {ticket.id}
          </code>
        </div>

        <div className='space-y-1'>
          <label className='text-sm font-medium'>Status</label>
          <Select defaultValue={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder='Select a status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='OPEN'>Open</SelectItem>
              <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
              <SelectItem value='RESOLVED'>Resolved</SelectItem>
              <SelectItem value='CLOSED'>Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {getApproveRejectButtons()}
      </CardContent>
      <CardFooter>
        <Button
          onClick={updateTicketStatus}
          disabled={status === ticket.status || isUpdating}
          className='w-full'
        >
          {isUpdating ? 'Updating...' : 'Update Status'}
        </Button>
      </CardFooter>
    </Card>
  );
}
