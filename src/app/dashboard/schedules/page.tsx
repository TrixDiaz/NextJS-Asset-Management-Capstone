"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Search, ChevronDown, FilterX, PlusCircle, AlertCircle } from 'lucide-react';
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

    // Add a seed function to create sample data if needed
    const seedSampleData = async () => {
        try {
            const origin = window.location.origin;
            const response = await fetch(`${origin}/api/seed`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Failed to seed data');
            }

            const data = await response.json();
            toast.success('Sample data created successfully');
            console.log('Seed result:', data);

            // Refresh schedules after seeding
            fetchSchedules();
        } catch (error) {
            console.error('Error seeding database:', error);
            toast.error('Failed to create sample data');
        }
    };

    return (
        <div className="p-6 space-y-6 w-full relative">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Schedules</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={seedSampleData}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Seed Sample Data
                    </Button>
                    <Link href="/dashboard/schedules/new">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Schedule
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex flex-1 items-center space-x-2">
                        <Input
                            placeholder="Search schedules..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 w-[150px] lg:w-[250px]"
                        />

                        {/* Day filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 border-dashed">
                                    Day
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {daysOfWeek.map(day => (
                                    <DropdownMenuCheckboxItem
                                        key={day}
                                        checked={dayFilter.includes(day)}
                                        onCheckedChange={() => toggleDayFilter(day)}
                                        className="capitalize"
                                    >
                                        {day}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {(searchQuery || dayFilter.length > 0) && (
                            <Button
                                variant="ghost"
                                onClick={resetFilters}
                                className="h-8 px-2 lg:px-3"
                            >
                                <FilterX className="mr-2 h-4 w-4" />
                                Reset filters
                            </Button>
                        )}
                    </div>
                </div>

                <div className="w-full overflow-auto">
                    {isLoading ? (
                        <div className="p-8 text-center">Loading schedules...</div>
                    ) : filteredAndSortedSchedules.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center">
                            {searchQuery || dayFilter.length > 0 ? (
                                <>
                                    <Calendar className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
                                    <h3 className="text-lg font-semibold">No schedules found</h3>
                                    <p className="text-muted-foreground mt-1">Try changing your search query or filters.</p>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
                                    <h3 className="text-lg font-semibold">No schedules available</h3>
                                    <p className="text-muted-foreground mt-1">Get started by creating your first schedule.</p>
                                    <Button className="mt-4" asChild>
                                        <Link href="/dashboard/schedules/new">
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Add Schedule
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => toggleSort('title')}
                                            className="p-0 hover:bg-transparent"
                                        >
                                            Title
                                            <ChevronDown className={`ml-2 h-4 w-4 ${sortField === 'title' ? 'opacity-100' : 'opacity-50'} 
                                            ${sortField === 'title' && sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => toggleSort('day')}
                                            className="p-0 hover:bg-transparent"
                                        >
                                            Day
                                            <ChevronDown className={`ml-2 h-4 w-4 ${sortField === 'day' ? 'opacity-100' : 'opacity-50'} 
                                            ${sortField === 'day' && sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => toggleSort('room')}
                                            className="p-0 hover:bg-transparent"
                                        >
                                            Room
                                            <ChevronDown className={`ml-2 h-4 w-4 ${sortField === 'room' ? 'opacity-100' : 'opacity-50'} 
                                            ${sortField === 'room' && sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => toggleSort('user')}
                                            className="p-0 hover:bg-transparent"
                                        >
                                            User
                                            <ChevronDown className={`ml-2 h-4 w-4 ${sortField === 'user' ? 'opacity-100' : 'opacity-50'} 
                                            ${sortField === 'user' && sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedSchedules.map(schedule => (
                                    <TableRow key={schedule.id}>
                                        <TableCell className="font-medium">
                                            {schedule.title}
                                        </TableCell>
                                        <TableCell className="capitalize">
                                            {schedule.dayOfWeek}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(schedule.startTime), 'h:mm a')} - {format(new Date(schedule.endTime), 'h:mm a')}
                                        </TableCell>
                                        <TableCell>
                                            {schedule.room.name || 'Room'} ({schedule.room.number || 'N/A'})
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/dashboard/users/${schedule.userId}/schedules`} className="hover:underline">
                                                {formatUserName(schedule.user)}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={`/dashboard/users/${schedule.userId}/schedules`}>
                                                    View
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-4 border-t">
                    <div className="flex-1 text-sm text-muted-foreground">
                        <span className="font-medium">{filteredAndSortedSchedules.length} schedules</span>
                    </div>
                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Rows per page</p>
                            <select
                                className="h-8 w-[70px] rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                                value={pageSize}
                                onChange={e => {
                                    setPageSize(Number(e.target.value));
                                    setPageIndex(0);
                                }}
                            >
                                {[ 5, 10, 20, 30, 40, 50 ].map(size => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center justify-center text-sm font-medium">
                            Page {pageIndex + 1} of {Math.max(1, pageCount)}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => setPageIndex(0)}
                                disabled={pageIndex === 0}
                                aria-label="Go to first page"
                            >
                                <span className="sr-only">Go to first page</span>
                                <span>«</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => setPageIndex(pageIndex - 1)}
                                disabled={pageIndex === 0}
                                aria-label="Go to previous page"
                            >
                                <span className="sr-only">Go to previous page</span>
                                <span>‹</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => setPageIndex(pageIndex + 1)}
                                disabled={pageIndex >= pageCount - 1}
                                aria-label="Go to next page"
                            >
                                <span className="sr-only">Go to next page</span>
                                <span>›</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => setPageIndex(pageCount - 1)}
                                disabled={pageIndex >= pageCount - 1}
                                aria-label="Go to last page"
                            >
                                <span className="sr-only">Go to last page</span>
                                <span>»</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 