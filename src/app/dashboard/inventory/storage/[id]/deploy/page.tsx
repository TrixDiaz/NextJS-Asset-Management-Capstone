'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import React from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox";
import { setEntityNameInStorage } from '@/hooks/use-breadcrumbs';

// Deployment form schema
const deploymentSchema = z.object({
    quantity: z.coerce.number()
        .min(1, { message: 'Quantity must be at least 1' }),
    roomId: z.string().min(1, { message: 'Room is required' }),
    serialNumbers: z.array(z.string()).optional(),
    serialNumber: z.string().optional(),
    remarks: z.string().optional(),
    multipleSelection: z.boolean().default(false),
});

type DeploymentFormValues = z.infer<typeof deploymentSchema>;

// Room type definition
type Room = {
    id: string;
    number: string;
    name: string | null;
    floor: {
        number: number;
        building: {
            name: string;
        }
    }
};

// Storage item type
type StorageItem = {
    id: string;
    name: string;
    itemType: string;
    subType: string | null;
    quantity: number;
    unit: string | null;
    serialNumbers: string[];
};

export default function DeployItemPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // Unwrap params with React.use()
    const unwrappedParams = React.use(params);
    const [ loading, setLoading ] = useState(false);
    const [ storageItem, setStorageItem ] = useState<StorageItem | null>(null);
    const [ rooms, setRooms ] = useState<Room[]>([]);
    const [ loadingData, setLoadingData ] = useState(true);
    const [ error, setError ] = useState<string | null>(null);
    const [ selectedSerialNumbers, setSelectedSerialNumbers ] = useState<string[]>([]);

    // Get ID from unwrapped params
    const id = unwrappedParams.id;

    // Check if serial number is required for this item type
    const isSerialNumberRequired = storageItem?.itemType === 'COMPUTER_PART' &&
        storageItem?.subType &&
        [ 'SYSTEM_UNIT', 'MONITOR', 'UPS' ].includes(storageItem.subType);

    // Check if this item type supports multiple selection
    const supportsMultipleSelection = isSerialNumberRequired;

    // Form setup
    const form = useForm<DeploymentFormValues>({
        resolver: zodResolver(deploymentSchema),
        defaultValues: {
            quantity: 1,
            roomId: '',
            serialNumber: '',
            serialNumbers: [],
            remarks: '',
            multipleSelection: false,
        },
    });

    // Watch for changes to multipleSelection
    const multipleSelection = form.watch('multipleSelection');

    // Reset serial number selections when multipleSelection changes
    useEffect(() => {
        if (multipleSelection) {
            form.setValue('serialNumber', '');
            form.setValue('serialNumbers', []);
            setSelectedSerialNumbers([]);
        } else {
            form.setValue('serialNumbers', []);
            setSelectedSerialNumbers([]);
        }
    }, [ multipleSelection, form ]);

    // Fetch storage item and rooms
    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setLoadingData(true);
                setError(null);

                // Get room ID from URL if it's a direct deployment to a specific room
                const urlParams = new URLSearchParams(window.location.search);
                const roomIdParam = urlParams.get('roomId');

                // Use dynamic origin to handle different ports
                const origin = window.location.origin;

                // Fetch storage item details
                console.log(`Fetching storage item: ${origin}/api/storage/${id}`);
                const itemResponse = await fetch(`${origin}/api/storage/${id}`);
                if (!itemResponse.ok) {
                    const errorData = await itemResponse.json();
                    throw new Error(errorData.error || 'Failed to fetch storage item');
                }
                const itemData = await itemResponse.json();
                console.log('Storage item data:', itemData);
                setStorageItem(itemData);

                // Store the storage item name in localStorage for breadcrumbs
                if (itemData && itemData.name) {
                    setEntityNameInStorage('storage', id, itemData.name);
                }

                // Fetch available rooms
                console.log(`Fetching rooms: ${origin}/api/rooms`);
                const roomsResponse = await fetch(`${origin}/api/rooms`);
                if (!roomsResponse.ok) {
                    const errorData = await roomsResponse.json();
                    throw new Error(errorData.error || 'Failed to fetch rooms');
                }
                const roomsData = await roomsResponse.json();
                console.log('Rooms data:', roomsData);
                setRooms(roomsData);

                // If roomId is in URL, pre-select it
                if (roomIdParam && roomsData.find((r: Room) => r.id === roomIdParam)) {
                    form.setValue('roomId', roomIdParam);
                }
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

    // Handle serial number selection
    const handleSerialNumberChange = (serialNumber: string, checked: boolean) => {
        if (checked) {
            const newSelected = [ ...selectedSerialNumbers, serialNumber ];
            setSelectedSerialNumbers(newSelected);
            form.setValue('serialNumbers', newSelected);
        } else {
            const newSelected = selectedSerialNumbers.filter(sn => sn !== serialNumber);
            setSelectedSerialNumbers(newSelected);
            form.setValue('serialNumbers', newSelected);
        }
    };

    const onSubmit = async (data: DeploymentFormValues) => {
        if (!storageItem) return;

        // Validate quantity for single selection
        if (!data.multipleSelection) {
            if (data.quantity > storageItem.quantity) {
                form.setError('quantity', {
                    message: `Cannot deploy more than available quantity (${storageItem.quantity})`
                });
                return;
            }

            // Validate serial number is required for certain computer parts
            if (isSerialNumberRequired && !data.serialNumber) {
                form.setError('serialNumber', {
                    message: `Serial number is required for ${storageItem.subType}`
                });
                return;
            }
        } else {
            // For multiple selection, validate we have at least one serial number
            if (data.serialNumbers?.length === 0) {
                toast.error('Please select at least one serial number');
                return;
            }

            // Set quantity to match the number of selected serial numbers
            data.quantity = data.serialNumbers?.length || 0;
        }

        try {
            setLoading(true);

            // Use dynamic origin to handle different ports
            const origin = window.location.origin;
            console.log(`Submitting deployment to: ${origin}/api/deployments`);
            console.log('Deployment data:', { storageItemId: id, ...data });

            if (data.multipleSelection && data.serialNumbers && data.serialNumbers.length > 0) {
                // Deploy multiple items with selected serial numbers
                const deploymentPromises = data.serialNumbers.map(serialNumber =>
                    fetch(`${origin}/api/deployments`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            storageItemId: id,
                            quantity: 1,
                            roomId: data.roomId,
                            serialNumber: serialNumber,
                            remarks: data.remarks
                        }),
                    })
                );

                const results = await Promise.all(deploymentPromises);

                // Check if all deployments were successful
                const failed = results.some(response => !response.ok);

                if (failed) {
                    throw new Error('One or more deployments failed');
                }

                toast.success(`${data.serialNumbers.length} items deployed successfully`);
            } else {
                // Single deployment
                const response = await fetch(`${origin}/api/deployments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        storageItemId: id,
                        quantity: data.quantity,
                        roomId: data.roomId,
                        serialNumber: data.serialNumber,
                        remarks: data.remarks
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.details || 'Failed to deploy item');
                }

                toast.success('Item deployed successfully');
            }

            router.push(`/dashboard/inventory/storage/${id}`);
            router.refresh();
        } catch (error) {
            console.error('Error deploying item:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to deploy item');
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

    if (!storageItem) {
        return <div className="p-6">Storage item not found</div>;
    }

    return (
        <div className="container p-6">
            <div className="flex items-center mb-4">
                <Link href={`/dashboard/inventory/storage/${id}`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Item
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Deploy Item: {storageItem.name}</CardTitle>
                    <CardDescription>
                        Currently in stock: {storageItem.quantity} {storageItem.unit || 'units'}
                        {storageItem.subType && <span className="ml-2">({storageItem.subType})</span>}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {rooms.length > 0 ? (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {supportsMultipleSelection && (
                                    <FormField
                                        control={form.control}
                                        name="multipleSelection"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                        Deploy multiple items with different serial numbers
                                                    </FormLabel>
                                                    <FormDescription>
                                                        This will let you select multiple {storageItem.subType?.toLowerCase() || 'items'} to deploy at once
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {!multipleSelection && (
                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quantity to Deploy</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        min={1}
                                                        max={storageItem.quantity}
                                                        disabled={loading}
                                                        // Force quantity=1 when serial number is required
                                                        onChange={(e) => {
                                                            const value = parseInt(e.target.value);
                                                            if (isSerialNumberRequired && value > 1) {
                                                                field.onChange(1);
                                                            } else {
                                                                field.onChange(value);
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    {isSerialNumberRequired && !multipleSelection
                                                        ? 'Items with serial numbers can only be deployed one at a time'
                                                        : 'Must be less than or equal to available quantity'}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {storageItem.serialNumbers && storageItem.serialNumbers.length > 0 && (
                                    multipleSelection ? (
                                        <FormField
                                            control={form.control}
                                            name="serialNumbers"
                                            render={() => (
                                                <FormItem>
                                                    <FormLabel>Select Serial Numbers</FormLabel>
                                                    <div className="border rounded-md p-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            {storageItem.serialNumbers.map((serial) => (
                                                                <div key={serial} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`serial-${serial}`}
                                                                        checked={selectedSerialNumbers.includes(serial)}
                                                                        onCheckedChange={(checked) =>
                                                                            handleSerialNumberChange(serial, checked === true)
                                                                        }
                                                                    />
                                                                    <label
                                                                        htmlFor={`serial-${serial}`}
                                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                                    >
                                                                        {serial}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <FormDescription>
                                                        Select multiple {storageItem.subType?.toLowerCase() || 'items'} to deploy
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ) : (
                                        <FormField
                                            control={form.control}
                                            name="serialNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {isSerialNumberRequired ? 'Serial Number (Required)' : 'Serial Number'}
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value || ""}
                                                        disabled={loading}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select serial number" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {storageItem.serialNumbers.map((serial) => (
                                                                <SelectItem key={serial} value={serial}>
                                                                    {serial}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>
                                                        {isSerialNumberRequired
                                                            ? `${storageItem.subType} requires a serial number`
                                                            : 'Select a specific serial number to deploy'}
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )
                                )}

                                <FormField
                                    control={form.control}
                                    name="roomId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Destination Room</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={loading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a room" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {rooms.map((room) => (
                                                        <SelectItem key={room.id} value={room.id}>
                                                            {room.floor.building.name} - Floor {room.floor.number} - Room {room.number}
                                                            {room.name && ` (${room.name})`}
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
                                    name="remarks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Remarks (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Additional notes about this deployment"
                                                    {...field}
                                                    disabled={loading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={
                                        loading ||
                                        (!multipleSelection && isSerialNumberRequired && !form.watch('serialNumber')) ||
                                        (multipleSelection && (
                                            !Array.isArray(form.watch('serialNumbers')) ||
                                            form.watch('serialNumbers')?.length === 0
                                        )) ||
                                        (!multipleSelection && storageItem.serialNumbers?.length > 0 && !!form.watch('serialNumber') && form.watch('quantity') > 1)
                                    }
                                >
                                    {loading ? 'Deploying...' : multipleSelection
                                        ? `Deploy ${selectedSerialNumbers.length} Items`
                                        : 'Deploy Item'}
                                </Button>
                            </form>
                        </Form>
                    ) : (
                        <div className="p-4 text-center">
                            <div className="text-amber-600 mb-4">No rooms available for deployment</div>
                            <p className="mb-4">Please create a room first before attempting to deploy items.</p>
                            <div className="flex justify-center">
                                <Link href="/dashboard/inventory/seed">
                                    <Button variant="outline">
                                        Seed Sample Data
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 