'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { LogAction, LogResource, LogLevel, LogEntry } from '@/lib/logger';
import { Skeleton } from '@/components/ui/skeleton';

// Implement our own debounce function instead of relying on lodash
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>): void {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const ITEMS_PER_PAGE = 10;

interface LogsDataTableProps {
  initialLogs?: any[];
}

export function LogsDataTable({ initialLogs = [] }: LogsDataTableProps) {
  // Table state
  const [logs, setLogs] = useState<any[]>(initialLogs);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0
  });

  // Filter state
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('');

  // Sorting state
  const [sortBy, setSortBy] = useState<string>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch logs from API
  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      // Add filters if they exist
      if (search) params.append('search', search);
      if (levelFilter && levelFilter !== 'all')
        params.append('level', levelFilter);
      if (actionFilter && actionFilter !== 'all')
        params.append('action', actionFilter);
      if (resourceFilter && resourceFilter !== 'all')
        params.append('resource', resourceFilter);
      if (userFilter) params.append('user', userFilter);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);

      // Fetch logs from API
      const response = await fetch(`/api/logs?${params.toString()}`);
      const data = await response.json();

      // Update state with fetched logs
      setLogs(data.data);
      setPagination({
        ...pagination,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      });
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search to avoid too frequent API calls
  const debouncedSearch = debounce(() => {
    setPagination({ ...pagination, page: 1 }); // Reset to first page on search
    fetchLogs();
  }, 500);

  // Effect to fetch logs when filters or pagination change
  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, sortBy, sortOrder]);

  // Effect for debounced search
  useEffect(() => {
    debouncedSearch();
    return () => {
      // Nothing to cancel with our simple debounce
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, levelFilter, actionFilter, resourceFilter, userFilter]);

  // Format timestamp to a readable format
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get badge color based on log level
  const getLevelBadgeColor = (
    level: string
  ): 'destructive' | 'secondary' | 'default' | 'outline' => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warn':
        return 'outline'; // Use outline for warning
      case 'info':
        return 'secondary'; // Use secondary for info
      case 'debug':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Get badge color based on action
  const getActionBadgeColor = (
    action: string
  ): 'destructive' | 'secondary' | 'default' | 'outline' => {
    switch (action) {
      case LogAction.CREATE:
        return 'secondary'; // Use secondary for create
      case LogAction.UPDATE:
        return 'secondary'; // Use secondary for update
      case LogAction.DELETE:
        return 'destructive';
      case LogAction.READ:
        return 'secondary';
      case LogAction.LOGIN:
        return 'outline'; // Use outline for login
      case LogAction.LOGOUT:
        return 'outline'; // Use outline for logout
      default:
        return 'default';
    }
  };

  // Sort handler
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column and default to descending order
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Pagination handlers
  const goToFirstPage = () => setPagination({ ...pagination, page: 1 });
  const goToPreviousPage = () =>
    setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) });
  const goToNextPage = () =>
    setPagination({
      ...pagination,
      page: Math.min(pagination.totalPages, pagination.page + 1)
    });
  const goToLastPage = () =>
    setPagination({ ...pagination, page: pagination.totalPages });

  // Render level options for filter
  const levelOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'debug', label: 'Debug' },
    { value: 'info', label: 'Info' },
    { value: 'warn', label: 'Warning' },
    { value: 'error', label: 'Error' }
  ];

  // Render action options for filter
  const actionOptions = [
    { value: 'all', label: 'All Actions' },
    { value: LogAction.LOGIN, label: 'Login' },
    { value: LogAction.LOGOUT, label: 'Logout' },
    { value: LogAction.CREATE, label: 'Create' },
    { value: LogAction.READ, label: 'Read' },
    { value: LogAction.UPDATE, label: 'Update' },
    { value: LogAction.DELETE, label: 'Delete' }
  ];

  // Render resource options for filter
  const resourceOptions = [
    { value: 'all', label: 'All Resources' },
    { value: LogResource.USER, label: 'User' },
    { value: LogResource.BUILDING, label: 'Building' },
    { value: LogResource.FLOOR, label: 'Floor' },
    { value: LogResource.ROOM, label: 'Room' },
    { value: LogResource.STORAGE, label: 'Storage' }
  ];

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center justify-between text-xl'>
          <span>System Logs</span>
          <Button
            size='sm'
            variant='outline'
            onClick={fetchLogs}
            className='flex items-center gap-1'
          >
            <RefreshCw className='h-4 w-4' />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>View and filter system activity logs</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className='mb-4 space-y-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <div className='relative min-w-[200px] flex-1'>
              <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
              <Input
                placeholder='Search logs...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-8'
              />
            </div>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='Level' />
              </SelectTrigger>
              <SelectContent>
                {levelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='Action' />
              </SelectTrigger>
              <SelectContent>
                {actionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='Resource' />
              </SelectTrigger>
              <SelectContent>
                {resourceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className='w-[180px] cursor-pointer'
                  onClick={() => handleSort('timestamp')}
                >
                  <div className='flex items-center'>
                    Timestamp
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                  </div>
                </TableHead>
                <TableHead
                  className='w-[100px] cursor-pointer'
                  onClick={() => handleSort('level')}
                >
                  <div className='flex items-center'>
                    Level
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                  </div>
                </TableHead>
                <TableHead
                  className='w-[100px] cursor-pointer'
                  onClick={() => handleSort('user')}
                >
                  <div className='flex items-center'>
                    User
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                  </div>
                </TableHead>
                <TableHead
                  className='w-[100px] cursor-pointer'
                  onClick={() => handleSort('action')}
                >
                  <div className='flex items-center'>
                    Action
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                  </div>
                </TableHead>
                <TableHead
                  className='w-[100px] cursor-pointer'
                  onClick={() => handleSort('resource')}
                >
                  <div className='flex items-center'>
                    Resource
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                  </div>
                </TableHead>
                <TableHead className='min-w-[200px]'>Message</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading state
                Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={7} className='h-16'>
                      <Skeleton className='h-6 w-full' />
                    </TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    No logs found
                  </TableCell>
                </TableRow>
              ) : (
                // Logs list
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className='font-mono text-xs'>
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getLevelBadgeColor(log.level)}>
                        {log.level}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className='max-w-[100px] truncate'
                      title={log.user}
                    >
                      {log.user}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeColor(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>{log.resource}</Badge>
                    </TableCell>
                    <TableCell className='font-medium'>{log.message}</TableCell>
                    <TableCell className='max-w-[200px] truncate'>
                      {log.details ? (
                        <span title={JSON.stringify(log.details, null, 2)}>
                          {JSON.stringify(log.details)}
                        </span>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className='flex items-center justify-between space-x-2 py-4'>
          <div className='text-muted-foreground text-sm'>
            Showing{' '}
            <span className='font-medium'>
              {logs.length > 0
                ? (pagination.page - 1) * pagination.limit + 1
                : 0}
            </span>{' '}
            to{' '}
            <span className='font-medium'>
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className='font-medium'>{pagination.total}</span> entries
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='icon'
              onClick={goToFirstPage}
              disabled={pagination.page === 1 || loading}
            >
              <ChevronsLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              onClick={goToPreviousPage}
              disabled={pagination.page === 1 || loading}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <span className='text-sm font-medium'>
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <Button
              variant='outline'
              size='icon'
              onClick={goToNextPage}
              disabled={
                pagination.page === pagination.totalPages ||
                pagination.totalPages === 0 ||
                loading
              }
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              onClick={goToLastPage}
              disabled={
                pagination.page === pagination.totalPages ||
                pagination.totalPages === 0 ||
                loading
              }
            >
              <ChevronsRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
