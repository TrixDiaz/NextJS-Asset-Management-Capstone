'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, Loader2, CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Room {
  id: string;
  number: string;
  name: string | null;
  floor: {
    number: number;
    building: {
      name: string;
    };
  };
}

interface Asset {
  id: string;
  assetTag: string | null;
  assetType: string;
  roomId: string | null;
}

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  ticketType: z.enum(['ISSUE_REPORT', 'ROOM_REQUEST', 'ASSET_REQUEST']),
  assetId: z.string().optional(),
  roomId: z.string().optional(),
  requestedAssetId: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  dayOfWeek: z.string().optional()
});

const timeOptions = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30'
];

const dayOptions = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' }
];

export default function CreateTicketButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTicketType, setSelectedTicketType] =
    useState<string>('ISSUE_REPORT');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      ticketType: 'ISSUE_REPORT',
      assetId: undefined,
      roomId: undefined,
      requestedAssetId: undefined,
      startTime: undefined,
      endTime: undefined,
      dayOfWeek: undefined
    }
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedTicketType('ISSUE_REPORT');
      setSelectedRoomId(null);
      setSelectedDate(undefined);
    }
  }, [open, form]);

  // Fetch rooms when the form opens
  useEffect(() => {
    if (open) {
      fetchRooms();
    }
  }, [open]);

  // Fetch assets when a room is selected
  useEffect(() => {
    if (selectedRoomId) {
      fetchAssetsByRoom(selectedRoomId);
    } else {
      setAssets([]);
      form.setValue('assetId', undefined);
      form.setValue('requestedAssetId', undefined);
    }
  }, [selectedRoomId, form]);

  // Update form when ticket type changes
  useEffect(() => {
    const ticketType = form.watch('ticketType');
    setSelectedTicketType(ticketType);
  }, [form.watch('ticketType')]);

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const response = await fetch('/api/rooms');

      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }

      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rooms',
        variant: 'destructive'
      });
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchAssetsByRoom = async (roomId: string) => {
    try {
      setLoadingAssets(true);
      const response = await fetch(`/api/assets?roomId=${roomId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }

      const data = await response.json();
      setAssets(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assets for the selected room',
        variant: 'destructive'
      });
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleRoomChange = (roomId: string) => {
    form.setValue('roomId', roomId);
    setSelectedRoomId(roomId);
    // Clear asset selection when room changes
    form.setValue('assetId', undefined);
    form.setValue('requestedAssetId', undefined);
  };

  // Create a date with the selected date and time
  const createDateTime = (date: Date | undefined, timeString: string) => {
    if (!date) return undefined;

    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);

    return newDate.toISOString();
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    // Validate required fields based on ticket type
    if (values.ticketType === 'ROOM_REQUEST') {
      if (!values.roomId) {
        toast({
          title: 'Validation Error',
          description: 'Room selection is required for room requests',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      if (!values.startTime || !values.endTime || !values.dayOfWeek) {
        toast({
          title: 'Validation Error',
          description:
            'Start time, end time, and day of week are required for room requests',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }
    }

    if (values.ticketType === 'ASSET_REQUEST' && !values.requestedAssetId) {
      toast({
        title: 'Validation Error',
        description: 'Asset selection is required for asset requests',
        variant: 'destructive'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create ticket');
      }

      const ticket = await response.json();
      toast({
        title: 'Ticket created',
        description: 'Your ticket has been created successfully'
      });
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create ticket',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className='mr-2 h-4 w-4' />
          New Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new support ticket
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue='ISSUE_REPORT'
          value={selectedTicketType}
          onValueChange={(value) => form.setValue('ticketType', value as any)}
          className='w-full'
        >
          <TabsList className='mb-4 grid grid-cols-3'>
            <TabsTrigger value='ISSUE_REPORT'>Issue Report</TabsTrigger>
            <TabsTrigger value='ROOM_REQUEST'>Room Request</TabsTrigger>
            <TabsTrigger value='ASSET_REQUEST'>Asset Request</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              {/* Hidden field for ticket type */}
              <FormField
                control={form.control}
                name='ticketType'
                render={({ field }) => (
                  <FormItem className='hidden'>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          selectedTicketType === 'ISSUE_REPORT'
                            ? 'Brief description of the issue'
                            : selectedTicketType === 'ROOM_REQUEST'
                              ? 'Purpose of room booking'
                              : 'Asset request purpose'
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          selectedTicketType === 'ISSUE_REPORT'
                            ? 'Detailed description of the issue'
                            : selectedTicketType === 'ROOM_REQUEST'
                              ? 'Details about the room booking (number of attendees, equipment needed, etc.)'
                              : 'Details about the asset request (why it is needed, for how long, etc.)'
                        }
                        className='min-h-24'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='priority'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a priority' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='LOW'>Low</SelectItem>
                        <SelectItem value='MEDIUM'>Medium</SelectItem>
                        <SelectItem value='HIGH'>High</SelectItem>
                        <SelectItem value='CRITICAL'>Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Common Room Selection for all ticket types */}
              <FormField
                control={form.control}
                name='roomId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedTicketType === 'ROOM_REQUEST'
                        ? 'Room to Reserve *'
                        : 'Related Room (Optional)'}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => handleRoomChange(value)}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a room' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingRooms ? (
                          <div className='flex items-center justify-center py-2'>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Loading rooms...
                          </div>
                        ) : rooms.length === 0 ? (
                          <div className='text-muted-foreground p-2 text-sm'>
                            No rooms available
                          </div>
                        ) : (
                          rooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.floor.building.name} - Floor{' '}
                              {room.floor.number} - Room {room.number}
                              {room.name && ` (${room.name})`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Asset Selection - Only shown for ISSUE_REPORT when a room is selected */}
              {selectedTicketType === 'ISSUE_REPORT' && selectedRoomId && (
                <FormField
                  control={form.control}
                  name='assetId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Asset (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select an asset' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingAssets ? (
                            <div className='flex items-center justify-center py-2'>
                              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                              Loading assets...
                            </div>
                          ) : assets.length === 0 ? (
                            <div className='text-muted-foreground p-2 text-sm'>
                              No assets available in this room
                            </div>
                          ) : (
                            assets.map((asset) => (
                              <SelectItem key={asset.id} value={asset.id}>
                                {asset.assetTag || asset.id} - {asset.assetType}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Asset Request Selection - Only shown for ASSET_REQUEST */}
              {selectedTicketType === 'ASSET_REQUEST' && selectedRoomId && (
                <FormField
                  control={form.control}
                  name='requestedAssetId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset to Request *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select an asset' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingAssets ? (
                            <div className='flex items-center justify-center py-2'>
                              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                              Loading assets...
                            </div>
                          ) : assets.length === 0 ? (
                            <div className='text-muted-foreground p-2 text-sm'>
                              No assets available to request
                            </div>
                          ) : (
                            assets.map((asset) => (
                              <SelectItem key={asset.id} value={asset.id}>
                                {asset.assetTag || asset.id} - {asset.assetType}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Schedule fields for ROOM_REQUEST */}
              {selectedTicketType === 'ROOM_REQUEST' && (
                <div className='space-y-4 rounded-md border p-4'>
                  <h3 className='text-sm font-medium'>
                    Scheduling Information *
                  </h3>

                  {/* Day of Week Selection */}
                  <FormField
                    control={form.control}
                    name='dayOfWeek'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day of Week</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select a day' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dayOptions.map((day) => (
                              <SelectItem key={day.value} value={day.value}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-2 gap-4'>
                    {/* Start Time */}
                    <FormField
                      control={form.control}
                      name='startTime'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <Select
                            onValueChange={(timeStr) => {
                              const date = new Date();
                              const [hours, minutes] = timeStr
                                .split(':')
                                .map(Number);
                              date.setHours(hours, minutes, 0, 0);
                              field.onChange(date.toISOString());
                            }}
                            value={
                              field.value
                                ? new Date(field.value)
                                    .toTimeString()
                                    .slice(0, 5)
                                : undefined
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Select start time' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeOptions.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* End Time */}
                    <FormField
                      control={form.control}
                      name='endTime'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <Select
                            onValueChange={(timeStr) => {
                              const date = new Date();
                              const [hours, minutes] = timeStr
                                .split(':')
                                .map(Number);
                              date.setHours(hours, minutes, 0, 0);
                              field.onChange(date.toISOString());
                            }}
                            value={
                              field.value
                                ? new Date(field.value)
                                    .toTimeString()
                                    .slice(0, 5)
                                : undefined
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Select end time' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeOptions.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Ticket'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
