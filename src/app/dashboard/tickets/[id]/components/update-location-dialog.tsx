'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Cpu, Loader2 } from 'lucide-react';
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
import { toast } from 'sonner';

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

interface Ticket {
  id: string;
  roomId: string | null;
  assetId: string | null;
  room: {
    id: string;
    number: string;
    name?: string;
  } | null;
  asset: {
    id: string;
    assetTag?: string;
    assetType: string;
  } | null;
}

interface UpdateLocationDialogProps {
  ticket: Ticket;
  onUpdate: () => void;
}

const formSchema = z.object({
  roomId: z.string().optional().nullable(),
  assetId: z.string().optional().nullable()
});

export default function UpdateLocationDialog({
  ticket,
  onUpdate
}: UpdateLocationDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    ticket.roomId
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomId: ticket.roomId || undefined,
      assetId: ticket.assetId || undefined
    }
  });

  // Fetch rooms when the dialog opens
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
      toast.error('Error', {
        description: 'Failed to load rooms'
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
      toast.error('Error', {
        description: 'Failed to load assets for the selected room'
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
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId: values.roomId,
          assetId: values.assetId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update ticket');
      }

      toast.success('Location updated', {
        description: 'Ticket location and asset have been updated'
      });

      setOpen(false);
      onUpdate();
      router.refresh();
    } catch (error) {
      toast.error('Error', {
        description:
          error instanceof Error ? error.message : 'Failed to update ticket'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Building className='mr-2 h-4 w-4' />
          Update Location/Asset
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Update Location & Asset</DialogTitle>
          <DialogDescription>
            Update the room location and associated asset for this ticket
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {/* Room Selection */}
            <FormField
              control={form.control}
              name='roomId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room</FormLabel>
                  <Select
                    onValueChange={(value) => handleRoomChange(value)}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a room' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value=''>None</SelectItem>
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
            <FormField
              control={form.control}
              name='assetId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                    disabled={!selectedRoomId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            selectedRoomId
                              ? 'Select an asset'
                              : 'Select a room first'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value=''>None</SelectItem>
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
                {isSubmitting ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
