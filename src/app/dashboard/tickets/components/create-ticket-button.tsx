'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, Loader2 } from 'lucide-react';
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
  assetId: z.string().optional(),
  roomId: z.string().optional()
});

export default function CreateTicketButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      assetId: undefined,
      roomId: undefined
    }
  });

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
    }
  }, [selectedRoomId, form]);

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
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
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
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new support ticket
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Brief description of the issue'
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
                      placeholder='Detailed description of the issue'
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

            {/* Room Selection */}
            <FormField
              control={form.control}
              name='roomId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room (Optional)</FormLabel>
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

            {/* Asset Selection - Only shown when a room is selected */}
            {selectedRoomId && (
              <FormField
                control={form.control}
                name='assetId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
      </DialogContent>
    </Dialog>
  );
}
