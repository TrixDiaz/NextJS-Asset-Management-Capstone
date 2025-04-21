'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Room type with related building and floor information
type Room = {
  id: string;
  number: string;
  name: string | null;
  floorId: string;
  floor: {
    id: string;
    number: number;
    name: string | null;
    buildingId: string;
    building: {
      id: string;
      name: string;
    };
  };
};

const assetSchema = z.object({
  assetTag: z.string().optional(),
  assetType: z.enum([
    'COMPUTER',
    'PRINTER',
    'PROJECTOR',
    'NETWORK_EQUIPMENT',
    'OTHER'
  ]),
  systemUnit: z.string().optional(),
  monitor: z.string().optional(),
  ups: z.string().optional(),
  status: z
    .enum(['WORKING', 'NEEDS_REPAIR', 'OUT_OF_SERVICE', 'UNDER_MAINTENANCE'])
    .default('WORKING'),
  remarks: z.string().optional(),
  roomId: z.string().min(1, { message: 'Room is required' })
});

type AssetFormValues = z.infer<typeof assetSchema>;

const assetTypes = [
  { value: 'COMPUTER', label: 'Computer' },
  { value: 'PRINTER', label: 'Printer' },
  { value: 'PROJECTOR', label: 'Projector' },
  { value: 'NETWORK_EQUIPMENT', label: 'Network Equipment' },
  { value: 'OTHER', label: 'Other' }
];

const assetStatuses = [
  { value: 'WORKING', label: 'Working' },
  { value: 'NEEDS_REPAIR', label: 'Needs Repair' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
  { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' }
];

interface AssetFormProps {
  initialData?: Partial<AssetFormValues>;
  roomId?: string;
}

export default function AssetForm({ initialData, roomId }: AssetFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const defaultValues = {
    assetTag: initialData?.assetTag || '',
    assetType: initialData?.assetType || 'COMPUTER',
    systemUnit: initialData?.systemUnit || '',
    monitor: initialData?.monitor || '',
    ups: initialData?.ups || '',
    status: initialData?.status || 'WORKING',
    remarks: initialData?.remarks || '',
    roomId: roomId || initialData?.roomId || ''
  };

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues
  });

  const assetType = form.watch('assetType');

  useEffect(() => {
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
        toast.error('Failed to load rooms');
        console.error(error);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    // Set roomId in form when available from props
    if (roomId) {
      form.setValue('roomId', roomId);
    }
  }, [roomId, form]);

  const onSubmit = async (data: AssetFormValues) => {
    try {
      setLoading(true);

      // API call would be implemented here
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create asset');
      }

      toast.success('Asset created successfully!');

      // Redirect to room detail or inventory
      if (data.roomId) {
        router.push(`/dashboard/inventory/rooms/${data.roomId}`);
      } else {
        router.push('/dashboard/inventory/assets');
      }

      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Information</CardTitle>
        <CardDescription>Add a new equipment asset to a room</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='roomId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room</FormLabel>
                  <Select
                    disabled={loading || loadingRooms || !!roomId}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a room' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.floor.building.name} - Floor {room.floor.number}{' '}
                          - Room {room.number}
                          {room.name && ` (${room.name})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='assetTag'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Tag (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., PC-001'
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormDescription>
                      A unique identifier for this asset
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='assetType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Type</FormLabel>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select asset type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assetTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {assetType === 'COMPUTER' && (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='systemUnit'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>System Unit</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Model/Serial Number'
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='monitor'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monitor</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Model/Serial Number'
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='ups'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UPS</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Model/Serial Number'
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assetStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='remarks'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Any additional information about this asset'
                      className='min-h-24'
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type='submit'
              className='w-full'
              disabled={loading || loadingRooms}
            >
              {loading ? 'Creating...' : 'Add Asset'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
