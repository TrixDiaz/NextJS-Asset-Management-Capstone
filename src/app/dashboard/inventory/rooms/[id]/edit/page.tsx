'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';

// Room form schema
const roomSchema = z.object({
    number: z.string().min(1, { message: 'Room number is required' }),
    name: z.string().optional(),
    type: z.string().optional(),
    floorId: z.string().min(1, { message: 'Floor is required' }),
});

type RoomFormValues = z.infer<typeof roomSchema>;

// Define room types for dropdown
const ROOM_TYPES = [
    'CLASSROOM',
    'OFFICE',
    'LABORATORY',
    'LIBRARY',
    'CONFERENCE',
    'STORAGE',
    'OTHER'
];

interface Floor {
    id: string;
    number: number;
    name: string | null;
    building: {
        id: string;
        name: string;
    }
}

interface RoomData {
    id: string;
    number: string;
    name: string | null;
    type: string | null;
    floorId: string;
    floor: Floor;
}

export default function EditRoomPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [ loading, setLoading ] = useState(false);
    const [ loadingData, setLoadingData ] = useState(true);
    const [ error, setError ] = useState<string | null>(null);
    const [ floors, setFloors ] = useState<Floor[]>([]);
    const [ roomData, setRoomData ] = useState<RoomData | null>(null);

    const id = params?.id;

    // Form setup
    const form = useForm<RoomFormValues>({
        resolver: zodResolver(roomSchema),
        defaultValues: {
            number: '',
            name: '',
            type: '',
            floorId: '',
        },
    });

    // Fetch room data and available floors
    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setLoadingData(true);
                setError(null);

                // Use dynamic origin to handle different ports
                const origin = window.location.origin;

                // Fetch room details
                const roomResponse = await fetch(`${origin}/api/rooms/${id}`);
                if (!roomResponse.ok) {
                    const errorData = await roomResponse.json();
                    throw new Error(errorData.error || 'Failed to fetch room');
                }

                const roomData = await roomResponse.json();
                setRoomData(roomData);

                // Set form values
                form.setValue('number', roomData.number);
                form.setValue('name', roomData.name || '');
                form.setValue('type', roomData.type || '');
                form.setValue('floorId', roomData.floorId);

                // Fetch available floors
                const floorsResponse = await fetch(`${origin}/api/floors`);
                if (!floorsResponse.ok) {
                    const errorData = await floorsResponse.json();
                    throw new Error(errorData.error || 'Failed to fetch floors');
                }

                const floorsData = await floorsResponse.json();
                setFloors(floorsData);
            } catch (error) {
                console.error('Error loading data:', error);
                setError(error instanceof Error ? error.message : 'An unknown error occurred');
                toast.error('Failed to load necessary data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [ id, form ]);

    const onSubmit = async (data: RoomFormValues) => {
        try {
            setLoading(true);

            // Use dynamic origin to handle different ports
            const origin = window.location.origin;

            // Submit form
            const response = await fetch(`${origin}/api/rooms/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update room');
            }

            toast.success('Room updated successfully');
            router.push(`/dashboard/inventory/rooms/${id}`);
            router.refresh();
        } catch (error) {
            console.error('Error updating room:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update room');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return <div className="p-6">Loading...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500">Error: {error}</div>;
    }

    if (!roomData) {
        return <div className="p-6">Room not found</div>;
    }

    return (
        <div className="container p-6">
            <div className="flex items-center mb-4">
                <Link href={`/dashboard/inventory/rooms/${id}`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Room Details
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Room</CardTitle>
                    <CardDescription>
                        Update room information for {roomData.number}
                        {roomData.name && ` (${roomData.name})`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Room Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 101" {...field} disabled={loading} />
                                        </FormControl>
                                        <FormDescription>The room's identifier</FormDescription>
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
                                            <Input placeholder="e.g., Computer Lab" {...field} disabled={loading} />
                                        </FormControl>
                                        <FormDescription>A descriptive name for the room</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Room Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value || ''}
                                            disabled={loading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select room type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {ROOM_TYPES.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type.replace('_', ' ')}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>The primary function of this room</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="floorId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Floor</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={loading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select floor" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {floors.map((floor) => (
                                                    <SelectItem key={floor.id} value={floor.id}>
                                                        {floor.building.name} - {floor.name || `Floor ${floor.number}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>The floor this room is located on</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-4 pt-4">
                                <Link href={`/dashboard/inventory/rooms/${id}`}>
                                    <Button variant="outline" type="button" disabled={loading}>
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
} 