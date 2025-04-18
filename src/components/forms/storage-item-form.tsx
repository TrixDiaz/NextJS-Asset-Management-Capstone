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
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { X } from 'lucide-react';

const ITEM_TYPES = [
    'CABLE',
    'SOFTWARE',
    'HARDWARE',
    'PERIPHERAL',
    'COMPONENT',
    'ACCESSORY',
    'COMPUTER_PART',
    'OTHER'
];

// Sub-types for computer parts
const COMPUTER_PART_TYPES = [
    'SYSTEM_UNIT',
    'MONITOR',
    'UPS'
];

const storageItemSchema = z.object({
    name: z.string().min(1, { message: 'Item name is required' }),
    itemType: z.string().min(1, { message: 'Item type is required' }),
    subType: z.string().optional(),
    quantity: z.coerce.number().nonnegative({ message: 'Quantity must be zero or positive' }).default(0),
    unit: z.string().optional(),
    remarks: z.string().optional(),
    serialNumbers: z.array(z.string()).optional().default([])
});

type StorageItemFormValues = z.infer<typeof storageItemSchema>;

interface StorageItemFormProps {
    initialData?: Partial<StorageItemFormValues>;
}

export default function StorageItemForm({ initialData }: StorageItemFormProps) {
    const router = useRouter();
    const params = useParams();
    const [ loading, setLoading ] = useState(false);
    const [ newSerial, setNewSerial ] = useState('');

    // Determine if this is an edit operation
    const isEditing = !!params?.id;
    const itemId = params?.id as string;

    const defaultValues = initialData || {
        name: '',
        itemType: '',
        subType: '',
        quantity: 0,
        unit: '',
        remarks: '',
        serialNumbers: []
    };

    const form = useForm<StorageItemFormValues>({
        resolver: zodResolver(storageItemSchema),
        defaultValues
    });

    const serialNumbers = form.watch('serialNumbers') || [];
    const itemType = form.watch('itemType');
    const subType = form.watch('subType');
    const quantity = form.watch('quantity');

    // Check if serial numbers are required (for computer parts)
    const isComputerPart = itemType === 'COMPUTER_PART';
    const serialNumbersRequired = isComputerPart && subType && [ 'SYSTEM_UNIT', 'MONITOR', 'UPS' ].includes(subType);

    // Validate that we have the right number of serial numbers for required types
    useEffect(() => {
        if (serialNumbersRequired && quantity > 0) {
            if (serialNumbers.length < quantity) {
                form.setError('serialNumbers', {
                    message: `${subType} requires a serial number for each unit (${serialNumbers.length}/${quantity})`
                });
            } else {
                form.clearErrors('serialNumbers');
            }
        }
    }, [ serialNumbers, quantity, subType, serialNumbersRequired, form ]);

    const addSerialNumber = () => {
        if (!newSerial.trim()) return;

        // Check for duplicates
        if (serialNumbers.includes(newSerial.trim())) {
            toast.error('This serial number already exists');
            return;
        }

        form.setValue('serialNumbers', [ ...serialNumbers, newSerial.trim() ]);
        setNewSerial('');
    };

    const removeSerialNumber = (index: number) => {
        const updatedSerials = [ ...serialNumbers ];
        updatedSerials.splice(index, 1);
        form.setValue('serialNumbers', updatedSerials);
    };

    const onSubmit = async (data: StorageItemFormValues) => {
        // Validate serial numbers for computer parts
        if (data.itemType === 'COMPUTER_PART' &&
            data.subType &&
            [ 'SYSTEM_UNIT', 'MONITOR', 'UPS' ].includes(data.subType) &&
            data.quantity > 0) {

            if (!data.serialNumbers || data.serialNumbers.length < data.quantity) {
                form.setError('serialNumbers', {
                    message: `${data.subType} requires a serial number for each unit`
                });
                return;
            }
        }

        try {
            setLoading(true);
            console.log("Submitting form data:", JSON.stringify(data, null, 2));

            let url, method;

            // Use different endpoints based on item type
            if (data.itemType === 'COMPUTER_PART') {
                if (isEditing) {
                    url = `${window.location.origin}/api/storage/computer-part/${itemId}`;
                    method = 'PATCH';
                } else {
                    url = `${window.location.origin}/api/storage/computer-part`;
                    method = 'POST';
                }
            } else if (isEditing) {
                url = `${window.location.origin}/api/storage/${itemId}`;
                method = 'PATCH';
            } else {
                url = `${window.location.origin}/api/storage`;
                method = 'POST';
            }

            // API call to create or update storage item
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!response.ok) {
                console.error("API error response:", responseData);
                throw new Error(responseData.error || responseData.details || `Failed to ${isEditing ? 'update' : 'create'} storage item`);
            }

            toast.success(`Storage item ${isEditing ? 'updated' : 'created'} successfully!`);

            if (isEditing) {
                router.push(`/dashboard/inventory/storage/${itemId}`);
            } else {
                router.push('/dashboard/inventory/storage');
            }

            router.refresh();
        } catch (error) {
            console.error("Form submission error:", error);
            toast.error(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Storage Item Details</CardTitle>
                <CardDescription>
                    {isEditing ? 'Update the storage item information' : 'Add an item to your inventory storage'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Item Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., HDMI Cable" {...field} disabled={loading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="itemType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Item Type</FormLabel>
                                    <Select
                                        disabled={loading}
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            // Reset subType when changing main type
                                            form.setValue('subType', '');
                                        }}
                                        defaultValue={field.value}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an item type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ITEM_TYPES.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {itemType === 'COMPUTER_PART' && (
                            <FormField
                                control={form.control}
                                name="subType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Computer Part Type</FormLabel>
                                        <Select
                                            disabled={loading}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select computer part type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {COMPUTER_PART_TYPES.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                placeholder="0"
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
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., pieces, boxes, meters"
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
                            name="serialNumbers"
                            render={() => (
                                <FormItem>
                                    <FormLabel>
                                        {serialNumbersRequired ? 'Serial Numbers (Required)' : 'Serial Numbers (Optional)'}
                                    </FormLabel>
                                    <div className="flex space-x-2">
                                        <Input
                                            placeholder="Enter serial number"
                                            value={newSerial}
                                            onChange={(e) => setNewSerial(e.target.value)}
                                            disabled={loading}
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={addSerialNumber}
                                            disabled={loading || !newSerial.trim()}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    {serialNumbersRequired && (
                                        <FormDescription>
                                            {subType} requires a serial number for each unit ({serialNumbers.length}/{quantity})
                                        </FormDescription>
                                    )}
                                    <div className="mt-2">
                                        {serialNumbers.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {serialNumbers.map((serial, index) => (
                                                    <div key={index} className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm">
                                                        {serial}
                                                        <button
                                                            type="button"
                                                            className="ml-2 text-secondary-foreground hover:text-destructive"
                                                            onClick={() => removeSerialNumber(index)}
                                                            disabled={loading}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No serial numbers added yet</p>
                                        )}
                                    </div>
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
                                            placeholder="Additional notes about this item"
                                            {...field}
                                            disabled={loading}
                                            className="min-h-24"
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
                                (serialNumbersRequired && (serialNumbers.length < quantity))
                            }
                        >
                            {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Item' : 'Add Item')}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
} 