'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Ticket } from 'lucide-react';

interface TicketBreadcrumbProps {
  ticketId: string;
}

export default function TicketBreadcrumb({ ticketId }: TicketBreadcrumbProps) {
  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicketTitle = async () => {
      try {
        const response = await fetch(`/api/tickets/${ticketId}`);
        if (response.ok) {
          const data = await response.json();
          setTitle(data.title);
        }
      } catch (error) {
        console.error('Error fetching ticket title:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketTitle();
  }, [ticketId]);

  return (
    <nav className='text-muted-foreground flex items-center text-sm'>
      <Link
        href='/dashboard'
        className='hover:text-foreground transition-colors'
      >
        Dashboard
      </Link>
      <ChevronRight className='mx-1 h-4 w-4' />
      <Link
        href='/dashboard/tickets'
        className='hover:text-foreground transition-colors'
      >
        Tickets
      </Link>
      <ChevronRight className='mx-1 h-4 w-4' />
      <div className='text-foreground flex items-center font-medium'>
        <Ticket className='mr-1 h-4 w-4' />
        {loading ? (
          <span className='animate-pulse'>Loading...</span>
        ) : (
          <span className='max-w-[200px] truncate'>
            {title || `Ticket #${ticketId.substring(0, 6)}`}
          </span>
        )}
      </div>
    </nav>
  );
}
