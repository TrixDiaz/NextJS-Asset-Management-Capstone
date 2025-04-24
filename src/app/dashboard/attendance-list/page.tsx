'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  CalendarIcon,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Schedule {
  id: string;
  title: string;
  room: {
    id: string;
    number: string;
    name: string | null;
  };
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface Attendance {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  section: string;
  yearLevel: string;
  subject: string;
  date: string;
  description: string | null;
  systemUnit: boolean;
  keyboard: boolean;
  mouse: boolean;
  internet: boolean;
  ups: boolean;
  scheduleId: string;
  createdAt: string;
  updatedAt: string;
  schedule: {
    id: string;
    title: string;
    room: {
      id: string;
      number: string;
      name: string | null;
    };
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
    };
  };
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AttendanceListPage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<string>('all');

  // Fetch schedules
  const fetchSchedules = async () => {
    setIsLoadingSchedules(true);
    try {
      const response = await fetch('/api/schedules');

      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }

      const data = await response.json();
      setSchedules(data.data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast('Error', {
        description: 'Failed to load schedules. Please try again.'
      });
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  // Fetch attendances
  const fetchAttendances = async (page = 1) => {
    setIsLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', pagination.limit.toString());

      if (startDate) {
        params.set('startDate', startDate.toISOString());
      }

      if (endDate) {
        params.set('endDate', endDate.toISOString());
      }

      if (selectedSchedule && selectedSchedule !== 'all') {
        params.set('scheduleId', selectedSchedule);
      }

      console.log(`Fetching attendances with params: ${params.toString()}`);
      const response = await fetch(`/api/attendance?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server response:', response.status, errorData);
        throw new Error(
          errorData.error ||
            `Failed to fetch attendance records: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('Attendance data received:', data);

      if (!data.data) {
        console.error('Invalid response format', data);
        throw new Error('Invalid response format from server');
      }

      setAttendances(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast('Error', {
        description:
          error instanceof Error
            ? error.message
            : 'Failed to load attendance records. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    fetchAttendances(1);
  }, [startDate, endDate, selectedSchedule]);

  // Filter attendance by search term
  const filteredAttendances = attendances.filter((attendance) => {
    if (!search) return true;

    const searchTerm = search.toLowerCase();
    return (
      attendance.firstName.toLowerCase().includes(searchTerm) ||
      attendance.lastName.toLowerCase().includes(searchTerm) ||
      attendance.email.toLowerCase().includes(searchTerm) ||
      attendance.section.toLowerCase().includes(searchTerm) ||
      attendance.subject.toLowerCase().includes(searchTerm)
    );
  });

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchAttendances(page);
  };

  // Reset filters
  const resetFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSearch('');
    setSelectedSchedule('all');
    fetchAttendances(1);
  };

  return (
    <div className='h-[calc(100vh-50px)] overflow-y-auto p-6'>
      <div className='container mx-auto py-4'>
        <h1 className='mb-6 text-2xl font-bold'>Attendance Records</h1>

        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Filter Attendance</CardTitle>
            <CardDescription>
              Filter attendance records by date range, schedule, or search by
              student information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col items-start gap-4 md:flex-row md:items-center'>
                <div className='flex items-center space-x-2'>
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className={cn(
                            'w-[180px] justify-start text-left font-normal',
                            !startDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className='mr-2 h-4 w-4' />
                          {startDate ? format(startDate, 'PPP') : 'Start Date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0'>
                        <Calendar
                          mode='single'
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <span>to</span>
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className={cn(
                            'w-[180px] justify-start text-left font-normal',
                            !endDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className='mr-2 h-4 w-4' />
                          {endDate ? format(endDate, 'PPP') : 'End Date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0'>
                        <Calendar
                          mode='single'
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className='w-full md:w-[220px]'>
                  <Select
                    value={selectedSchedule}
                    onValueChange={(value) => setSelectedSchedule(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Filter by schedule' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Schedules</SelectItem>
                      {schedules.map((schedule) => (
                        <SelectItem key={schedule.id} value={schedule.id}>
                          {schedule.title} - Room {schedule.room.number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='flex flex-col gap-4 md:flex-row'>
                <div className='flex-1'>
                  <div className='relative'>
                    <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
                    <Input
                      placeholder='Search by name, email, section...'
                      className='pl-8'
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <Button variant='outline' onClick={resetFilters}>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              Showing {filteredAttendances.length} of {pagination.total} records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center justify-center py-8'>
                <RefreshCw className='h-6 w-6 animate-spin' />
                <span className='ml-2'>Loading attendance records...</span>
              </div>
            ) : filteredAttendances.length === 0 ? (
              <div className='text-muted-foreground py-8 text-center'>
                No attendance records found.
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Equipment Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendances.map((attendance) => (
                      <TableRow key={attendance.id}>
                        <TableCell>
                          {format(new Date(attendance.date), 'PPP')}
                        </TableCell>
                        <TableCell>
                          {attendance.firstName} {attendance.lastName}
                        </TableCell>
                        <TableCell>{attendance.email}</TableCell>
                        <TableCell>{attendance.section}</TableCell>
                        <TableCell>{attendance.subject}</TableCell>
                        <TableCell>
                          {attendance.schedule.room.number}
                          {attendance.schedule.room.name &&
                            ` - ${attendance.schedule.room.name}`}
                        </TableCell>
                        <TableCell>
                          {attendance.schedule.user.firstName}{' '}
                          {attendance.schedule.user.lastName}
                        </TableCell>
                        <TableCell>
                          <div className='flex space-x-1'>
                            {attendance.systemUnit ? (
                              <Badge
                                variant='default'
                                className='flex items-center'
                              >
                                <CheckCircle className='mr-1 h-3 w-3' />
                                PC
                              </Badge>
                            ) : (
                              <Badge
                                variant='destructive'
                                className='flex items-center'
                              >
                                <XCircle className='mr-1 h-3 w-3' />
                                PC
                              </Badge>
                            )}

                            {attendance.keyboard ? (
                              <Badge
                                variant='default'
                                className='flex items-center'
                              >
                                <CheckCircle className='mr-1 h-3 w-3' />
                                KB
                              </Badge>
                            ) : (
                              <Badge
                                variant='destructive'
                                className='flex items-center'
                              >
                                <XCircle className='mr-1 h-3 w-3' />
                                KB
                              </Badge>
                            )}

                            {attendance.mouse ? (
                              <Badge
                                variant='default'
                                className='flex items-center'
                              >
                                <CheckCircle className='mr-1 h-3 w-3' />M
                              </Badge>
                            ) : (
                              <Badge
                                variant='destructive'
                                className='flex items-center'
                              >
                                <XCircle className='mr-1 h-3 w-3' />M
                              </Badge>
                            )}

                            {attendance.internet ? (
                              <Badge
                                variant='default'
                                className='flex items-center'
                              >
                                <CheckCircle className='mr-1 h-3 w-3' />
                                Net
                              </Badge>
                            ) : (
                              <Badge
                                variant='destructive'
                                className='flex items-center'
                              >
                                <XCircle className='mr-1 h-3 w-3' />
                                Net
                              </Badge>
                            )}

                            {attendance.ups ? (
                              <Badge
                                variant='default'
                                className='flex items-center'
                              >
                                <CheckCircle className='mr-1 h-3 w-3' />
                                UPS
                              </Badge>
                            ) : (
                              <Badge
                                variant='destructive'
                                className='flex items-center'
                              >
                                <XCircle className='mr-1 h-3 w-3' />
                                UPS
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className='w-full'>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Math.max(1, pagination.page - 1))
                      }
                      className={
                        pagination.page <= 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>

                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const pageNumber = i + 1;

                    // Show first page, current page, last page, and one page before and after current page
                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.totalPages ||
                      (pageNumber >= pagination.page - 1 &&
                        pageNumber <= pagination.page + 1)
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            isActive={pageNumber === pagination.page}
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    // Show ellipsis for gaps
                    if (
                      pageNumber === 2 ||
                      pageNumber === pagination.totalPages - 1
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(
                          Math.min(pagination.totalPages, pagination.page + 1)
                        )
                      }
                      className={
                        pagination.page >= pagination.totalPages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
