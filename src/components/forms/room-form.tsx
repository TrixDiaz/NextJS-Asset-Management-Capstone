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
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Define types for Building and Floor
type Building = {
  id: string;
  name: string;
};

type Floor = {
  id: string;
  number: number;
  name: string | null;
};

const roomSchema = z.object({
  number: z.string().min(1, { message: 'Room number is required' }),
  name: z.string().optional(),
  type: z
    .enum([
      'CLASSROOM',
      'OFFICE',
      'LABORATORY',
      'MEETING_ROOM',
      'STORAGE',
      'OTHER'
    ])
    .default('CLASSROOM'),
  floorId: z.string().min(1, { message: 'Floor is required' }),
  buildingId: z.string().optional() // Only used when no floorId is provided
});

type RoomFormValues = z.infer<typeof roomSchema>;

const roomTypes = [
  { value: 'CLASSROOM', label: 'Classroom' },
  { value: 'OFFICE', label: 'Office' },
  { value: 'LABORATORY', label: 'Laboratory' },
  { value: 'MEETING_ROOM', label: 'Meeting Room' },
  { value: 'STORAGE', label: 'Storage' },
  { value: 'OTHER', label: 'Other' }
];

interface RoomFormProps {
  initialData?: RoomFormValues;
  floorId?: string;
}

export default function RoomForm({ initialData, floorId }: RoomFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');

  // Fetch buildings on component mount
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await fetch('/api/buildings');
        if (!response.ok) throw new Error('Failed to fetch buildings');
        const data = await response.json();
        setBuildings(data);
      } catch (error) {
        console.error('Error fetching buildings:', error);
        toast.error('Failed to load buildings');
      }
    };

    fetchBuildings();
  }, []);

  // Fetch floors for a building when building is selected
  useEffect(() => {
    if (!selectedBuilding) {
      setFloors([]);
      return;
    }

    const fetchFloors = async () => {
      try {
        const response = await fetch(
          `/api/floors?buildingId=${selectedBuilding}`
        );
        if (!response.ok) throw new Error('Failed to fetch floors');
        const data = await response.json();
        setFloors(data);
      } catch (error) {
        console.error('Error fetching floors:', error);
        toast.error('Failed to load floors');
      }
    };

    fetchFloors();
  }, [selectedBuilding]);

  // If floorId is provided, fetch the floor's building details
  useEffect(() => {
    if (!floorId) return;

    const fetchFloorDetails = async () => {
      try {
        const response = await fetch(`/api/floors/${floorId}`);
        if (!response.ok) throw new Error('Failed to fetch floor details');
        const floorData = await response.json();
        setSelectedBuilding(floorData.buildingId);
      } catch (error) {
        console.error('Error fetching floor details:', error);
        toast.error('Failed to load floor details');
      }
    };

    fetchFloorDetails();
  }, [floorId]);

  const defaultValues = {
    number: initialData?.number || '',
    name: initialData?.name || '',
    type: initialData?.type || 'CLASSROOM',
    floorId: floorId || initialData?.floorId || '',
    buildingId: initialData?.buildingId || ''
  };

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues
  });

  const onSubmit = async (data: RoomFormValues) => {
    try {
      setLoading(true);

      // Use the provided floorId or the one from form data
      const finalData = {
        number: data.number,
        name: data.name,
        type: data.type,
        floorId: floorId || data.floorId
      };

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalData)
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      const responseData = await response.json();

      toast.success('Room created successfully!');

      // Redirect back to the floor detail page
      router.push(`/dashboard/inventory/floors/${finalData.floorId}`);
      router.refresh();
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Room Information</CardTitle>
        <CardDescription>
          Add a new room to {floorId ? 'this floor' : 'any floor'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {!floorId && (
              <>
                <FormField
                  control={form.control}
                  name='buildingId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Building</FormLabel>
                      <Select
                        disabled={loading}
                        onValueChange={(value) => {
                          setSelectedBuilding(value);
                          field.onChange(value);
                          // Reset the floor selection when building changes
                          form.setValue('floorId', '');
                        }}
                        value={selectedBuilding}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a building' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {buildings.map((building) => (
                            <SelectItem key={building.id} value={building.id}>
                              {building.name}
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
                  name='floorId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor</FormLabel>
                      <Select
                        disabled={
                          loading || !selectedBuilding || floors.length === 0
                        }
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a floor' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {floors.map((floor) => (
                            <SelectItem key={floor.id} value={floor.id}>
                              Floor {floor.number}{' '}
                              {floor.name ? `- ${floor.name}` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {!selectedBuilding && (
                        <FormDescription>
                          Please select a building first
                        </FormDescription>
                      )}
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., 101, A-201'
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
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Name (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., Computer Lab'
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Type</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select room type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roomTypes.map((type) => (
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

            <Button
              type='submit'
              className='w-full'
              disabled={loading || (!floorId && !form.getValues('floorId'))}
            >
              {loading ? 'Creating...' : 'Add Room'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
