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
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const roomSchema = z.object({
    number: z.string().min(1, { message: 'Room number is required' }),
    name: z.string().optional(),
    type: z.enum([ 'CLASSROOM', 'OFFICE', 'LABORATORY', 'MEETING_ROOM', 'STORAGE', 'OTHER' ]).default('CLASSROOM'),
    floorId: z.string().min(1, { message: 'Floor is required' })
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
    const [ loading, setLoading ] = useState(false);

    const defaultValues = {
        number: initialData?.number || '',
        name: initialData?.name || '',
        type: initialData?.type || 'CLASSROOM',
        floorId: floorId || initialData?.floorId || ''
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
                ...data,
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
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Room Information</CardTitle>
                <CardDescription>Add a new room to this floor</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Room Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., 101, A-201"
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
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Room Name (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Computer Lab"
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
                            name="type"
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
                                                <SelectValue placeholder="Select room type" />
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

                        {!floorId && (
                            <FormField
                                control={form.control}
                                name="floorId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Floor</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="hidden"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creating...' : 'Add Room'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
} 