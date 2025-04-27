'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  CalendarIcon,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
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
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: {
    id: string;
    number: string;
    name: string | null;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
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
  schedule: Schedule;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AttendanceListPage() {
  const [ attendances, setAttendances ] = useState<Attendance[]>([]);
  const [ schedules, setSchedules ] = useState<Schedule[]>([]);
  const [ isLoading, setIsLoading ] = useState(true);
  const [ isLoadingSchedules, setIsLoadingSchedules ] = useState(false);
  const [ pagination, setPagination ] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [ startDate, setStartDate ] = useState<Date | undefined>(undefined);
  const [ endDate, setEndDate ] = useState<Date | undefined>(undefined);
  const [ search, setSearch ] = useState('');
  const [ selectedSchedule, setSelectedSchedule ] = useState<string>('all');
  const [ error, setError ] = useState<string | null>(null);

  // Fetch schedules for filter dropdown
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch('/api/schedules', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          next: { revalidate: 0 }
        });

        if (!response.ok) {
          throw new Error(`Error fetching schedules: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          // Sort schedules by day and time
          const sortedSchedules = [ ...result.data ].sort((a, b) => {
            const dayOrder: Record<string, number> = {
              'monday': 1,
              'tuesday': 2,
              'wednesday': 3,
              'thursday': 4,
              'friday': 5,
              'saturday': 6,
              'sunday': 7
            };

            // First sort by day
            const dayDiff = (dayOrder[ a.dayOfWeek as string ] || 0) - (dayOrder[ b.dayOfWeek as string ] || 0);
            if (dayDiff !== 0) return dayDiff;

            // Then by time
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          });

          setSchedules(sortedSchedules);
        } else {
          setSchedules([]);
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
        setSchedules([]);
      }
    };

    fetchSchedules();
  }, []);

  // Fetch attendances
  const fetchAttendances = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());

      if (selectedSchedule && selectedSchedule !== 'all') {
        params.set('scheduleId', selectedSchedule);
      }

      if (startDate) {
        params.set('startDate', startDate.toISOString());
      }

      if (endDate) {
        // Add one day to make it inclusive
        const endDateWithOffset = new Date(endDate);
        endDateWithOffset.setDate(endDateWithOffset.getDate() + 1);
        params.set('endDate', endDateWithOffset.toISOString());
      }

      console.log(`Fetching attendances with params: ${params.toString()}`);
      const response = await fetch(`/api/attendance?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        next: { revalidate: 0 }
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch attendance records: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('Attendance data received:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch attendance records');
      }

      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      });

      setAttendances(data.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load attendance records. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances(1);
  }, [ startDate, endDate, selectedSchedule ]);

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
              <div className='flex items-center justify-center py-6'>
                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                <span className='ml-2'>Loading attendance records...</span>
              </div>
            ) : error ? (
              <div className='flex flex-col items-center justify-center py-6'>
                <div className='text-destructive'>Error: {error}</div>
                <Button
                  variant='outline'
                  size='sm'
                  className='mt-2'
                  onClick={() => fetchAttendances(1)}
                >
                  Retry
                </Button>
              </div>
            ) : filteredAttendances.length === 0 ? (
              <div className='flex items-center justify-center py-6 text-gray-500'>
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
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className='flex items-center justify-between'>
                          <div className='text-sm text-muted-foreground'>
                            Showing {filteredAttendances.length} of {pagination.total} records
                          </div>
                          <div className='flex items-center space-x-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => fetchAttendances(pagination.page - 1)}
                              disabled={pagination.page <= 1 || isLoading}
                            >
                              Previous
                            </Button>
                            <span className='text-sm'>
                              Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => fetchAttendances(pagination.page + 1)}
                              disabled={
                                pagination.page >= pagination.totalPages || isLoading
                              }
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
