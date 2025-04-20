'use client';

import { useState, useEffect } from 'react';
import { ResourcePermissionWrapper, ResourceActionButtons } from '@/components/permissions/resource-permission-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface StorageItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    location: string;
    createdAt: string;
}

export default function StoragePage() {
    const [ items, setItems ] = useState<StorageItem[]>([]);
    const [ isLoading, setIsLoading ] = useState(true);

    useEffect(() => {
        const fetchStorageItems = async () => {
            setIsLoading(true);
            try {
                // In a real app, you would fetch from your API
                // Simulated data for demo
                const mockItems: StorageItem[] = [
                    {
                        id: '1',
                        name: 'Laptops',
                        category: 'Electronics',
                        quantity: 25,
                        location: 'Main Storage Room',
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: '2',
                        name: 'Projectors',
                        category: 'Electronics',
                        quantity: 10,
                        location: 'AV Equipment Room',
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: '3',
                        name: 'Lab Supplies',
                        category: 'Consumables',
                        quantity: 100,
                        location: 'Science Storage',
                        createdAt: new Date().toISOString()
                    }
                ];

                setItems(mockItems);
            } catch (error) {
                console.error('Error fetching storage items:', error);
                toast.error('Failed to load storage items');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStorageItems();
    }, []);

    const handleDeleteItem = (id: string) => {
        // Normally you would call your API to delete the item
        toast.success(`Would delete item ${id} (demo only)`);

        // Update local state to remove the item
        setItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <ResourcePermissionWrapper
            resourceType="storage"
            title="Storage Inventory"
            createHref="/dashboard/storage/new"
        >
            <Card>
                <CardHeader>
                    <CardTitle>All Items</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-4">Loading inventory...</div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground">No items found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{item.category}</Badge>
                                        </TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>{item.location}</TableCell>
                                        <TableCell className="text-right">
                                            <ResourceActionButtons
                                                resourceType="storage"
                                                editHref={`/dashboard/storage/${item.id}/edit`}
                                                onDelete={() => handleDeleteItem(item.id)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </ResourcePermissionWrapper>
    );
} 