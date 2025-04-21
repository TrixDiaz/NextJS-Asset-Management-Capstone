'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
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

type Building = {
  id: string;
  name: string;
};

const floorSchema = z.object({
  number: z.coerce
    .number()
    .int()
    .positive({ message: 'Floor number must be a positive integer' }),
  name: z.string().optional(),
  buildingId: z.string().min(1, { message: 'Building is required' })
});

type FloorFormValues = z.infer<typeof floorSchema>;

interface FloorFormProps {
  initialData?: Partial<FloorFormValues>;
  buildingId?: string;
}

export default function FloorForm({ initialData, buildingId }: FloorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loadingBuildings, setLoadingBuildings] = useState(false);

  const defaultValues = {
    number: initialData?.number || 1,
    name: initialData?.name || '',
    buildingId: buildingId || initialData?.buildingId || ''
  };

  const form = useForm<FloorFormValues>({
    resolver: zodResolver(floorSchema),
    defaultValues
  });

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        setLoadingBuildings(true);
        const response = await fetch('/api/buildings');

        if (!response.ok) {
          throw new Error('Failed to fetch buildings');
        }

        const data = await response.json();
        setBuildings(data);
      } catch (error) {
        toast.error('Failed to load buildings');
        console.error(error);
      } finally {
        setLoadingBuildings(false);
      }
    };

    fetchBuildings();
  }, []);

  useEffect(() => {
    // Set buildingId in form when available from props
    if (buildingId) {
      form.setValue('buildingId', buildingId);
    }
  }, [buildingId, form]);

  const onSubmit = async (data: FloorFormValues) => {
    try {
      setLoading(true);

      // API call would be implemented here
      const response = await fetch('/api/floors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create floor');
      }

      toast.success('Floor created successfully!');

      // Redirect to building detail or inventory
      if (data.buildingId) {
        router.push(`/dashboard/inventory/buildings/${data.buildingId}`);
      } else {
        router.push('/dashboard/inventory');
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
        <CardTitle>Floor Information</CardTitle>
        <CardDescription>Add a new floor to a building</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='buildingId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Building</FormLabel>
                  <Select
                    disabled={loading || loadingBuildings || !!buildingId}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
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

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor Number</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        placeholder='1'
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
                    <FormLabel>Floor Name (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., Ground Floor'
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type='submit'
              className='w-full'
              disabled={loading || loadingBuildings}
            >
              {loading ? 'Creating...' : 'Add Floor'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
