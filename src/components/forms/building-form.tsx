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
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const buildingSchema = z.object({
    name: z.string().min(1, { message: 'Building name is required' }),
    code: z.string().optional(),
    address: z.string().optional()
});

type BuildingFormValues = z.infer<typeof buildingSchema>;

interface BuildingFormProps {
    initialData?: BuildingFormValues;
}

export default function BuildingForm({ initialData }: BuildingFormProps) {
    const router = useRouter();
    const [ loading, setLoading ] = useState(false);

    const defaultValues = initialData || {
        name: '',
        code: '',
        address: ''
    };

    const form = useForm<BuildingFormValues>({
        resolver: zodResolver(buildingSchema),
        defaultValues
    });

    const onSubmit = async (data: BuildingFormValues) => {
        try {
            setLoading(true);

            // API call would be implemented here
            const response = await fetch('/api/buildings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create building');
            }

            toast.success('Building created successfully!');
            router.push('/dashboard/inventory');
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
                <CardTitle>Building Information</CardTitle>
                <CardDescription>Create a new building in the inventory system</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Building Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., KorPhil" {...field} disabled={loading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Building Code (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., BLD-001" {...field} disabled={loading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter building address"
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
                            {loading ? 'Creating...' : 'Create Building'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
} 