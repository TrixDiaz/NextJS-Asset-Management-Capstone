'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Ticket } from 'lucide-react';

interface TicketBreadcrumbProps {
    ticketId: string;
}

export default function TicketBreadcrumb({ ticketId }: TicketBreadcrumbProps) {
    const [ title, setTitle ] = useState<string | null>(null);
    const [ loading, setLoading ] = useState(true);

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
    }, [ ticketId ]);

    return (
        <nav className="flex items-center text-sm text-muted-foreground">
            <Link
                href="/dashboard"
                className="hover:text-foreground transition-colors"
            >
                Dashboard
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link
                href="/dashboard/tickets"
                className="hover:text-foreground transition-colors"
            >
                Tickets
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <div className="flex items-center font-medium text-foreground">
                <Ticket className="h-4 w-4 mr-1" />
                {loading ? (
                    <span className="animate-pulse">Loading...</span>
                ) : (
                    <span className="truncate max-w-[200px]">
                        {title || `Ticket #${ticketId.substring(0, 6)}`}
                    </span>
                )}
            </div>
        </nav>
    );
} 