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
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const ITEM_TYPES = [
    'CABLE',
    'SOFTWARE',
    'HARDWARE',
    'PERIPHERAL',
    'COMPONENT',
    'ACCESSORY',
    'OTHER'
];

const storageItemSchema = z.object({
    name: z.string().min(1, { message: 'Item name is required' }),
    itemType: z.string().min(1, { message: 'Item type is required' }),
    quantity: z.coerce.number().nonnegative({ message: 'Quantity must be zero or positive' }).default(0),
    unit: z.string().optional(),
    remarks: z.string().optional()
});

type StorageItemFormValues = z.infer<typeof storageItemSchema>;

interface StorageItemFormProps {
    initialData?: Partial<StorageItemFormValues>;
}

export default function StorageItemForm({ initialData }: StorageItemFormProps) {
    const router = useRouter();
    const params = useParams();
    const [ loading, setLoading ] = useState(false);

    // Determine if this is an edit operation
    const isEditing = !!params?.id;
    const itemId = params?.id as string;

    const defaultValues = initialData || {
        name: '',
        itemType: '',
        quantity: 0,
        unit: '',
        remarks: ''
    };

    const form = useForm<StorageItemFormValues>({
        resolver: zodResolver(storageItemSchema),
        defaultValues
    });

    const onSubmit = async (data: StorageItemFormValues) => {
        try {
            setLoading(true);

            let url = '/api/storage';
            let method = 'POST';

            // If editing, use the update endpoint with ID
            if (isEditing) {
                url = `/api/storage/${itemId}`;
                method = 'PATCH';
            }

            // API call to create or update storage item
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} storage item`);
            }

            toast.success(`Storage item ${isEditing ? 'updated' : 'created'} successfully!`);

            if (isEditing) {
                router.push(`/dashboard/inventory/storage/${itemId}`);
            } else {
                router.push('/dashboard/inventory/storage');
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
                                        onValueChange={field.onChange}
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

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Item' : 'Add Item')}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
} 