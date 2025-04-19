'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EyeIcon, ClockIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Ticket type definition
interface Ticket {
    id: string;
    title: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    createdAt: string;
    asset?: {
        id: string;
        assetTag?: string;
        assetType: string;
    } | null;
    room?: {
        id: string;
        number: string;
        name?: string;
        floor?: {
            number: number;
            building?: {
                name: string;
            } | null;
        } | null;
    } | null;
}

interface TicketListTabProps {
    filter: 'all' | 'created' | 'assigned';
}

export default function TicketListTab({ filter }: TicketListTabProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status');
    const [ tickets, setTickets ] = useState<Ticket[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<string | null>(null);

    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            setError(null);

            try {
                // Build query parameters based on filter and status
                const queryParams = new URLSearchParams();
                if (status) queryParams.set('status', status);

                if (filter === 'created') {
                    queryParams.set('createdByMe', 'true');
                } else if (filter === 'assigned') {
                    queryParams.set('assignedToMe', 'true');
                }

                const response = await fetch(`/api/tickets?${queryParams.toString()}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch tickets');
                }

                const data = await response.json();
                setTickets(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                console.error('Error fetching tickets:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [ filter, status ]);

    if (loading) {
        return <p>Loading tickets...</p>;
    }

    if (error) {
        return <p className="text-destructive">Error: {error}</p>;
    }

    if (tickets.length === 0) {
        return (
            <Card className="p-8 text-center text-muted-foreground">
                <p>No tickets found for the selected filter.</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {tickets.map((ticket) => (
                <div
                    key={ticket.id}
                    className="border rounded-md p-4 cursor-pointer hover:bg-accent/50"
                    onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h3 className="font-medium text-foreground">{ticket.title}</h3>
                        <div className="flex items-center gap-2">
                            <StatusBadge status={ticket.status} />
                            <PriorityBadge priority={ticket.priority} />
                            <Button variant="ghost" size="icon" onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/tickets/${ticket.id}`);
                            }}>
                                <EyeIcon className="h-4 w-4" />
                                <span className="sr-only">View ticket</span>
                            </Button>
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        <p className="line-clamp-1">{ticket.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs">
                            <div className="flex items-center gap-1">
                                <ClockIcon className="h-3 w-3" />
                                <span>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
                            </div>
                            {ticket.asset && (
                                <span>Asset: {ticket.asset.assetTag || `${ticket.asset.assetType} (No tag)`}</span>
                            )}
                            {ticket.room && (
                                <span>Room: {ticket.room.number}{ticket.room.name ? ` - ${ticket.room.name}` : ''}</span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    let variant: "default" | "destructive" | "outline" | "secondary" = "default";

    switch (status) {
        case 'OPEN':
            variant = "default";
            break;
        case 'IN_PROGRESS':
            variant = "secondary";
            break;
        case 'RESOLVED':
            // Use a custom color instead of unavailable variant
            return (
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                    {status.replace('_', ' ').toLowerCase()}
                </Badge>
            );
        case 'CLOSED':
            variant = "outline";
            break;
    }

    return (
        <Badge variant={variant}>
            {status.replace('_', ' ').toLowerCase()}
        </Badge>
    );
}

function PriorityBadge({ priority }: { priority: string }) {
    let className = "bg-gray-100 text-gray-800";

    switch (priority) {
        case 'LOW':
            className = "bg-blue-100 text-blue-800";
            break;
        case 'MEDIUM':
            className = "bg-yellow-100 text-yellow-800";
            break;
        case 'HIGH':
            className = "bg-orange-100 text-orange-800";
            break;
        case 'CRITICAL':
            className = "bg-red-100 text-red-800";
            break;
    }

    return (
        <span className={`text-xs px-2 py-1 rounded-full ${className}`}>
            {priority.toLowerCase()}
        </span>
    );
} 