'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

export default function TicketStatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get('status') || '';
  // Convert empty status to "all" for the select component
  const selectValue = currentStatus || 'all';

  const handleStatusChange = (value: string) => {
    // Create a new URLSearchParams instance from the current query params
    const params = new URLSearchParams(searchParams);

    // Delete the status param if value is "all", otherwise set it
    if (value === 'all') {
      params.delete('status');
    } else {
      params.set('status', value);
    }

    // Update the URL with the new query params
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className='flex items-center gap-2'>
      <Filter className='text-muted-foreground h-4 w-4' />
      <Select value={selectValue} onValueChange={handleStatusChange}>
        <SelectTrigger className='h-8 w-40'>
          <SelectValue placeholder='Filter Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Statuses</SelectItem>
          <SelectItem value='OPEN'>Open</SelectItem>
          <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
          <SelectItem value='RESOLVED'>Resolved</SelectItem>
          <SelectItem value='CLOSED'>Closed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
