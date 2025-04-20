"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Search, ChevronDown, FilterX, PlusCircle, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { toast } from "sonner";
import { useUser } from '@clerk/nextjs';
import { PermissionLink } from '@/components/auth/permission-link';
import {
    SCHEDULE_CREATE,
    SCHEDULE_READ,
    SCHEDULE_UPDATE,
    SCHEDULE_DELETE
} from '@/constants/permissions';
import { User as AppUser } from '@/types/user';
import { ResourcePermissionWrapper, ResourceActionButtons } from '@/components/permissions/resource-permission-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/use-permissions';

// Define permission actions
type Permission = 'create' | 'edit' | 'delete' | 'read' | 'export';

interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
}

interface Room {
    id: string;
    name: string;
    number: string;
    floor?: {
        id: string;
        number: number;
        building?: {
            id: string;
            name: string;
        }
    }
}

interface Schedule {
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    dayOfWeek: string;
    userId: string;
    roomId: string;
    room: Room;
    user: User;
    status: 'upcoming' | 'active' | 'completed' | 'cancelled';
    organizer: string;
    createdAt: string;
}

type SortDirection = 'asc' | 'desc' | null;
type SortField = 'title' | 'day' | 'room' | 'user';

const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
];

export default function SchedulesPage() {
    const [ schedules, setSchedules ] = useState<Schedule[]>([]);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ searchQuery, setSearchQuery ] = useState('');
    const [ sortField, setSortField ] = useState<SortField | null>(null);
    const [ sortDirection, setSortDirection ] = useState<SortDirection>(null);
    const [ dayFilter, setDayFilter ] = useState<string[]>([]);
    const [ pageIndex, setPageIndex ] = useState(0);
    const [ pageSize, setPageSize ] = useState(10);
    const { user } = useUser();

    // Create application user for permission checks
    const userForPermissions: AppUser | null = user ? {
        id: user.id,
        clerkId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.emailAddresses[ 0 ]?.emailAddress || null,
        profileImageUrl: user.imageUrl,
        role: (user.publicMetadata?.role as any) || 'member',
        createdAt: new Date(),
        updatedAt: new Date()
    } : null;

    // Get permissions from our hook
    const permissionsApi = usePermissions(userForPermissions as any);
    const { can } = permissionsApi;

    // Function to check if user has permission for a specific action
    const hasPermission = (action: Permission): boolean => {
        switch (action) {
            case 'create':
                return can(SCHEDULE_CREATE);
            case 'edit':
                return can(SCHEDULE_UPDATE);
            case 'delete':
                return can(SCHEDULE_DELETE);
            case 'read':
                return can(SCHEDULE_READ);
            case 'export':
                // Allow export for any user with READ permissions
                return userForPermissions?.role !== 'guest';
            default:
                return false;
        }
    };

    // Define the fetchSchedules function first so it can be referenced elsewhere
    const fetchSchedules = async () => {
        try {
            setIsLoading(true);
            const origin = window.location.origin;
            const response = await fetch(`${origin}/api/schedules`);
            if (!response.ok) throw new Error('Failed to fetch schedules');
            const data = await response.json();
            setSchedules(data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error loading schedules:", error);
            setIsLoading(false);
            toast.error("Failed to load schedules");
        }
    };

    // Fetch all schedules on component mount
    useEffect(() => {
        let isMounted = true;

        const initialFetch = async () => {
            try {
                await fetchSchedules();
            } catch (error) {
                console.error("Error in initial fetch:", error);
            }
        };

        initialFetch();

        // Cleanup function to prevent state updates after unmount
        return () => {
            isMounted = false;
        };
    }, []);

    // Filter and sort schedules
    const filteredAndSortedSchedules = useMemo(() => {
        // First, filter the schedules
        let result = [ ...schedules ];

        // Apply day filter
        if (dayFilter.length > 0) {
            result = result.filter(schedule => dayFilter.includes(schedule.dayOfWeek));
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(schedule =>
                (schedule.title && schedule.title.toLowerCase().includes(query)) ||
                (schedule.description && schedule.description.toLowerCase().includes(query)) ||
                (schedule.room.name && schedule.room.name.toLowerCase().includes(query)) ||
                (schedule.user.firstName && schedule.user.firstName.toLowerCase().includes(query)) ||
                (schedule.user.lastName && schedule.user.lastName.toLowerCase().includes(query)) ||
                (schedule.user.username && schedule.user.username.toLowerCase().includes(query))
            );
        }

        // Apply sorting
        if (sortField && sortDirection) {
            result.sort((a, b) => {
                let valueA: any;
                let valueB: any;

                // Extract values based on sort field
                switch (sortField) {
                    case 'title':
                        valueA = a.title || '';
                        valueB = b.title || '';
                        break;
                    case 'day':
                        // Sort by the day of week index for proper order
                        valueA = daysOfWeek.indexOf(a.dayOfWeek);
                        valueB = daysOfWeek.indexOf(b.dayOfWeek);
                        break;
                    case 'room':
                        valueA = a.room.name || '';
                        valueB = b.room.name || '';
                        break;
                    case 'user':
                        valueA = `${a.user.firstName || ''} ${a.user.lastName || ''}`.trim() || a.user.username || '';
                        valueB = `${b.user.firstName || ''} ${b.user.lastName || ''}`.trim() || b.user.username || '';
                        break;
                    default:
                        return 0;
                }

                // Compare values
                if (valueA < valueB) {
                    return sortDirection === 'asc' ? -1 : 1;
                }
                if (valueA > valueB) {
                    return sortDirection === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return result;
    }, [ schedules, searchQuery, sortField, sortDirection, dayFilter ]);

    // Calculate pagination
    const pageCount = Math.ceil(filteredAndSortedSchedules.length / pageSize);
    const paginatedSchedules = useMemo(() => {
        const start = pageIndex * pageSize;
        const end = start + pageSize;
        return filteredAndSortedSchedules.slice(start, end);
    }, [ filteredAndSortedSchedules, pageIndex, pageSize ]);

    // Toggle column sort
    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            // Cycle through: asc -> desc -> null
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortField(null);
                setSortDirection(null);
            }
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const resetFilters = () => {
        setSearchQuery('');
        setDayFilter([]);
    };

    const toggleDayFilter = (day: string) => {
        setDayFilter(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [ ...prev, day ]
        );
    };

    // Format user name
    const formatUserName = (user: User) => {
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        } else if (user.username) {
            return user.username;
        } else if (user.email) {
            return user.email;
        }
        return "Unknown User";
    };

    const handleDeleteSchedule = (id: string) => {
        toast.success(`Schedule deleted successfully`);
        setSchedules(prev => prev.filter(schedule => schedule.id !== id));
    };

    const getStatusBadge = (status: Schedule[ 'status' ]) => {
        switch (status) {
            case 'upcoming':
                return 'secondary';
            case 'active':
                return 'default';
            case 'completed':
                return 'outline';
            case 'cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <ResourcePermissionWrapper
            resourceType="schedule"
            title="Schedules"
            createHref="/dashboard/schedules/create"
        >
            <Card>
                <CardHeader>
                    <CardTitle>All Schedules</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-4">Loading schedules...</div>
                    ) : schedules.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground">No schedules found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Organizer</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedules.map((schedule) => (
                                    <TableRow key={schedule.id}>
                                        <TableCell className="font-medium">{schedule.title}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="flex items-center text-xs text-muted-foreground mb-1">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {new Date(schedule.startTime).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center text-xs">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {new Date(schedule.startTime).toLocaleTimeString()} - {new Date(schedule.endTime).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div>{schedule.room.name || 'Room'} ({schedule.room.number || 'N/A'})</div>
                                                <div className="text-xs text-muted-foreground">{schedule.room.floor?.building?.name || 'N/A'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadge(schedule.status)}>
                                                {schedule.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{schedule.organizer}</TableCell>
                                        <TableCell className="text-right">
                                            <ResourceActionButtons
                                                resourceType="schedules"
                                                showDelete={true}
                                                showEdit={true}
                                                onDelete={() => handleDeleteSchedule(schedule.id)}
                                                editHref={`/dashboard/schedules/${schedule.id}/edit`}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </ResourcePermissionWrapper>
    );
} 