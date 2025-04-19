'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CircleDashed,
    RotateCw,
    CheckCircle,
    AlertCircle,
    Clock,
    CalendarDays,
    CheckSquare,
    XCircle,
    User,
    Building,
    Cpu
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface Ticket {
    id: string;
    title: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    createdById: string;
    assignedToId: string | null;
    moderatorId: string | null;
    assetId: string | null;
    roomId: string | null;
    createdAt: string;
    updatedAt: string;
    resolvedAt: string | null;
    asset: {
        id: string;
        assetTag?: string;
        assetType: string;
    } | null;
    room: {
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

interface TicketDetailViewProps {
    id: string;
}

export default function TicketDetailView({ id }: TicketDetailViewProps) {
    const [ ticket, setTicket ] = useState<Ticket | null>(null);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<string | null>(null);
    const [ updating, setUpdating ] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchTicket = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/tickets/${id}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch ticket details');
                }

                const data = await response.json();
                setTicket(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                console.error('Error fetching ticket:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [ id ]);

    const updateTicketStatus = async (status: string) => {
        if (!ticket) return;

        setUpdating(true);
        try {
            const response = await fetch(`/api/tickets/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error('Failed to update ticket status');
            }

            const updatedTicket = await response.json();
            setTicket(updatedTicket);
            toast.success('Status updated', {
                description: `Ticket status has been updated to ${status.toLowerCase().replace('_', ' ')}`,
            });
            router.refresh();
        } catch (error) {
            toast.error('Error', {
                description: error instanceof Error ? error.message : 'Failed to update ticket',
            });
        } finally {
            setUpdating(false);
        }
    };

    const assignToMe = async () => {
        if (!ticket) return;

        setUpdating(true);
        try {
            const response = await fetch(`/api/tickets/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'IN_PROGRESS' }),
            });

            if (!response.ok) {
                throw new Error('Failed to assign ticket');
            }

            const updatedTicket = await response.json();
            setTicket(updatedTicket);
            toast.success('Ticket assigned', {
                description: 'You have been assigned to this ticket',
            });
            router.refresh();
        } catch (error) {
            toast.error('Error', {
                description: error instanceof Error ? error.message : 'Failed to assign ticket',
            });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <p>Loading ticket details...</p>;
    }

    if (error) {
        return <p className="text-destructive">Error: {error}</p>;
    }

    if (!ticket) {
        return <p>Ticket not found</p>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <CardTitle>{ticket.title}</CardTitle>
                        <CardDescription>
                            Created {format(new Date(ticket.createdAt), 'PPP')}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{ticket.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Details</h3>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Created by:</span>
                                <span>User #{ticket.createdById.substring(0, 6)}</span>
                            </div>

                            {ticket.assignedToId ? (
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Assigned to:</span>
                                    <span>User #{ticket.assignedToId.substring(0, 6)}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Not assigned</span>
                                </div>
                            )}

                            {ticket.moderatorId && (
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Moderator:</span>
                                    <span>User #{ticket.moderatorId.substring(0, 6)}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-sm">
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Last updated:</span>
                                <span>{format(new Date(ticket.updatedAt), 'PPP')}</span>
                            </div>

                            {ticket.resolvedAt && (
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-muted-foreground">Resolved:</span>
                                    <span>{format(new Date(ticket.resolvedAt), 'PPP')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Location & Asset</h3>
                        <div className="space-y-1">
                            {ticket.asset ? (
                                <div className="flex items-center gap-2 text-sm">
                                    <Cpu className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Asset:</span>
                                    <span>
                                        {ticket.asset.assetTag || `${ticket.asset.assetType} (No tag)`}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Cpu className="h-4 w-4" />
                                    <span>No asset specified</span>
                                </div>
                            )}

                            {ticket.room ? (
                                <div className="flex items-center gap-2 text-sm">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Room:</span>
                                    <span>
                                        {ticket.room.number}
                                        {ticket.room.name && ` - ${ticket.room.name}`}
                                        {ticket.room.floor?.building && ` (${ticket.room.floor.building.name})`}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Building className="h-4 w-4" />
                                    <span>No room specified</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select
                        value={ticket.status}
                        onValueChange={updateTicketStatus}
                        disabled={updating}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    {!ticket.assignedToId && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        onClick={assignToMe}
                                        disabled={updating}
                                    >
                                        <CheckSquare className="mr-2 h-4 w-4" />
                                        Assign to Me
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Claim this ticket and change status to In Progress</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        Close
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

function StatusBadge({ status }: { status: string }) {
    let variant: "default" | "destructive" | "outline" | "secondary" = "default";
    let icon = CircleDashed;

    switch (status) {
        case 'OPEN':
            variant = "default";
            icon = CircleDashed;
            break;
        case 'IN_PROGRESS':
            variant = "secondary";
            icon = RotateCw;
            break;
        case 'RESOLVED':
            // Custom styling for resolved
            return (
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200 px-2 py-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {status.replace('_', ' ').toLowerCase()}
                </Badge>
            );
        case 'CLOSED':
            variant = "outline";
            icon = CheckCircle;
            break;
    }

    const Icon = icon;

    return (
        <Badge variant={variant} className="px-2 py-1 flex items-center gap-1">
            <Icon className="h-3 w-3" />
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
        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${className}`}>
            <Clock className="h-3 w-3" />
            {priority.toLowerCase()}
        </span>
    );
} 