'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, SaveIcon } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Schema for schedule creation
const scheduleFormSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string().optional(),
    startTime: z.string().min(1, { message: 'Start time is required' }),
    endTime: z.string().min(1, { message: 'End time is required' }),
    dayOfWeek: z.enum([ 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday' ]),
    userId: z.string().min(1, { message: 'User is required' }),
    roomId: z.string().min(1, { message: 'Room is required' }),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
}

interface Room {
    id: string;
    name: string;
    number: string;
    floor?: {
        id: string;
        number: number;
        building?: {
            id: string;
            name: string;
        }
    }
}

export default function NewSchedulePage() {
    const router = useRouter();
    const [ users, setUsers ] = useState<User[]>([]);
    const [ rooms, setRooms ] = useState<Room[]>([]);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ isPageLoading, setIsPageLoading ] = useState(true);

    const form = useForm<ScheduleFormValues>({
        resolver: zodResolver(scheduleFormSchema),
        defaultValues: {
            title: '',
            description: '',
            startTime: '08:00',
            endTime: '09:00',
            dayOfWeek: 'monday',
        },
    });

    // Fetch users from API
    const fetchUsers = async () => {
        try {
            const origin = window.location.origin;
            const response = await fetch(`${origin}/api/users`);
            if (!response.ok) {
                console.error('Response error:', await response.text());
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data);
            return data;
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Failed to load users');
            return [];
        }
    };

    // Fetch rooms from API
    const fetchRooms = async () => {
        try {
            const origin = window.location.origin;
            const response = await fetch(`${origin}/api/rooms`);
            if (!response.ok) {
                console.error('Response error:', await response.text());
                throw new Error('Failed to fetch rooms');
            }
            const data = await response.json();
            setRooms(data);
            return data;
        } catch (error) {
            console.error('Error loading rooms:', error);
            toast.error('Failed to load rooms');
            return [];
        }
    };

    // Create sample data if needed
    const createSampleData = async () => {
        try {
            setIsPageLoading(true);
            const origin = window.location.origin;
            const response = await fetch(`${origin}/api/seed`);
            if (!response.ok) {
                console.error('Response error:', await response.text());
                throw new Error('Failed to seed data');
            }

            const data = await response.json();
            console.log('Sample data created:', data);

            if (data.success && data.sampleData) {
                // Update form with sample data if available
                if (data.sampleData.userId) {
                    form.setValue('userId', data.sampleData.userId);
                }

                if (data.sampleData.roomId) {
                    form.setValue('roomId', data.sampleData.roomId);
                }
            }

            // Refresh users and rooms
            const fetchedUsers = await fetchUsers();
            const fetchedRooms = await fetchRooms();

            // Check if we should auto-select values
            if (fetchedUsers.length === 1 && !form.getValues('userId')) {
                form.setValue('userId', fetchedUsers[ 0 ].id);
            }

            if (fetchedRooms.length === 1 && !form.getValues('roomId')) {
                form.setValue('roomId', fetchedRooms[ 0 ].id);
            }

            setIsPageLoading(false);
        } catch (error) {
            console.error('Error creating sample data:', error);
            toast.error('Failed to create sample data');
            setIsPageLoading(false);
        }
    };

    // Initialize the page
    useEffect(() => {
        const initPage = async () => {
            setIsPageLoading(true);

            // Try to fetch existing data
            const fetchedUsers = await fetchUsers();
            const fetchedRooms = await fetchRooms();

            // If no data exists, create sample data
            if (fetchedUsers.length === 0 || fetchedRooms.length === 0) {
                await createSampleData();
            } else {
                // If we have existing data, check if we should auto-select values
                if (fetchedUsers.length === 1 && !form.getValues('userId')) {
                    form.setValue('userId', fetchedUsers[ 0 ].id);
                }

                if (fetchedRooms.length === 1 && !form.getValues('roomId')) {
                    form.setValue('roomId', fetchedRooms[ 0 ].id);
                }

                setIsPageLoading(false);
            }
        };

        initPage();
    }, []);

    const onSubmit = async (values: ScheduleFormValues) => {
        try {
            setIsLoading(true);
            const origin = window.location.origin;

            // Format the time values properly for the API
            // We need to create full ISO date-time strings
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset to midnight

            // Parse start time
            const [ startHours, startMinutes ] = values.startTime.split(':').map(Number);
            const startDate = new Date(today);
            startDate.setHours(startHours, startMinutes);

            // Parse end time
            const [ endHours, endMinutes ] = values.endTime.split(':').map(Number);
            const endDate = new Date(today);
            endDate.setHours(endHours, endMinutes);

            const payload = {
                ...values,
                startTime: startDate.toISOString(),
                endTime: endDate.toISOString(),
            };

            console.log('Submitting schedule with payload:', payload);

            const response = await fetch(`${origin}/api/schedules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json();

            if (!response.ok) {
                console.error('Server error response:', responseData);
                throw new Error(responseData.error || 'Failed to create schedule');
            }

            toast.success('Schedule created successfully');
            router.push('/dashboard/schedules');
        } catch (error) {
            console.error('Error creating schedule:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create schedule');
        } finally {
            setIsLoading(false);
        }
    };

    // Format user name
    const formatUserName = (user: User) => {
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        } else if (user.username) {
            return user.username;
        } else if (user.email) {
            return user.email;
        }
        return "Unknown User";
    };

    // Format room name
    const formatRoomName = (room: Room) => {
        let roomName = room.name || 'Room';
        if (room.number) {
            roomName += ` (${room.number})`;
        }

        if (room.floor?.building) {
            roomName += ` - ${room.floor.building.name}`;
        }

        return roomName;
    };

    // Generate time options with 30-minute intervals
    const generateTimeOptions = () => {
        const options = [];
        const startHour = 7; // 7:00 AM
        const endHour = 22; // 10:00 PM

        for (let hour = startHour; hour <= endHour; hour++) {
            // Add hour:00
            options.push({
                value: `${hour.toString().padStart(2, '0')}:00`,
                label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
            });

            // Add hour:30 if not the last hour
            if (hour < endHour) {
                options.push({
                    value: `${hour.toString().padStart(2, '0')}:30`,
                    label: `${hour > 12 ? hour - 12 : hour}:30 ${hour >= 12 ? 'PM' : 'AM'}`
                });
            }
        }

        return options;
    };

    const timeOptions = generateTimeOptions();

    // Update the render to show loading state
    if (isPageLoading) {
        return (
            <div className="container p-6">
                <div className="flex items-center mb-4">
                    <Link href="/dashboard/schedules">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Schedules
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Create New Schedule</CardTitle>
                        <CardDescription>
                            Loading resources...
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center min-h-[300px]">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                            <p>Loading users and rooms...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container p-6">
            <div className="flex items-center mb-4">
                <Link href="/dashboard/schedules">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Schedules
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create New Schedule</CardTitle>
                    <CardDescription>
                        Fill out the form below to create a new class schedule
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter class or event title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter schedule description"
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="dayOfWeek"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Day of Week</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select day" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="monday">Monday</SelectItem>
                                                    <SelectItem value="tuesday">Tuesday</SelectItem>
                                                    <SelectItem value="wednesday">Wednesday</SelectItem>
                                                    <SelectItem value="thursday">Thursday</SelectItem>
                                                    <SelectItem value="friday">Friday</SelectItem>
                                                    <SelectItem value="saturday">Saturday</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                        control={form.control}
                                        name="startTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Time</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select start time" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {timeOptions.map(option => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
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
                                        name="endTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Time</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select end time" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {timeOptions.map(option => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="userId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>User</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select user" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {users.map(user => (
                                                        <SelectItem key={user.id} value={user.id}>
                                                            {formatUserName(user)}
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
                                    name="roomId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Room</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select room" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {rooms.map(room => (
                                                        <SelectItem key={room.id} value={room.id}>
                                                            {formatRoomName(room)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>Creating Schedule...</>
                                ) : (
                                    <>
                                        <SaveIcon className="mr-2 h-4 w-4" />
                                        Create Schedule
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
} 