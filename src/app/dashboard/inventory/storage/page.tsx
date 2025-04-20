"use client";

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { PermissionLink } from '@/components/auth/permission-link';
import { STORAGE_CREATE, STORAGE_READ, STORAGE_UPDATE, STORAGE_DELETE, BUILDING_READ } from '@/constants/permissions';
import { User as AppUser } from '@/types/user';
import { usePermissions } from '@/hooks/use-permissions';

// Define permission actions
type Permission = 'create' | 'edit' | 'delete' | 'read' | 'export';

// Define StorageItem type
type StorageItem = {
    id: string;
    name: string;
    itemType: string;
    quantity: number;
    unit: string | null;
    remarks: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export default function StorageInventoryPage() {
    const [ storageItems, setStorageItems ] = useState<StorageItem[]>([]);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ error, setError ] = useState<Error | null>(null);
    const { user } = useUser();

    // Create user object for permission checks
    const userForPermissions: AppUser | null = user ? {
        id: user.id,
        clerkId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.emailAddresses[ 0 ]?.emailAddress || null,
        profileImageUrl: user.imageUrl,
        role: (user.publicMetadata?.role as any) || 'member',
        createdAt: new Date(),
        updatedAt: new Date()
    } : null;

    // Get permissions from our hook
    const permissionsApi = usePermissions(userForPermissions as any);
    const { can } = permissionsApi;

    // Function to check if user has permission for a specific action
    const hasPermission = (action: Permission): boolean => {
        switch (action) {
            case 'create':
                return can(STORAGE_CREATE);
            case 'edit':
                return can(STORAGE_UPDATE);
            case 'delete':
                return can(STORAGE_DELETE);
            case 'read':
                return can(STORAGE_READ);
            case 'export':
                // Allow export for any user with READ permissions
                return userForPermissions?.role !== 'guest';
            default:
                return false;
        }
    };

    // Fetch storage items
    useEffect(() => {
        async function fetchStorageItems() {
            try {
                setIsLoading(true);
                const response = await fetch('/api/storage');
                if (!response.ok) throw new Error('Failed to fetch storage items');
                const data = await response.json();
                setStorageItems(data);
                setIsLoading(false);
            } catch (err) {
                console.error("Error in storage inventory:", err);
                setError(err instanceof Error ? err : new Error(String(err)));
                setIsLoading(false);
            }
        }

        fetchStorageItems();
    }, []);

    if (isLoading) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">Storage Inventory</h1>
                <div className="p-8 text-center">Loading storage items...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">Storage Inventory</h1>
                <div className="bg-red-50 border border-red-300 p-4 rounded-md">
                    <p className="text-red-700">There was an error loading the storage inventory.</p>
                    <p className="text-sm text-red-500 mt-2">Error details: {error.message}</p>
                </div>
            </div>
        );
    }

    // Use empty array if no data
    const items = storageItems || [];

    // Group items by type for better organization
    const groupedItems: Record<string, StorageItem[]> = {};
    items.forEach(item => {
        if (!groupedItems[ item.itemType ]) {
            groupedItems[ item.itemType ] = [];
        }
        groupedItems[ item.itemType ].push(item);
    });

    // Sort item types alphabetically
    const sortedItemTypes = Object.keys(groupedItems).sort();

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Storage Inventory</h1>
                <div className="flex gap-2">
                    <PermissionLink
                        href="/dashboard/inventory/storage/new"
                        permission={STORAGE_CREATE}
                        user={userForPermissions}
                    >
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                    </PermissionLink>
                    <PermissionLink
                        href="/dashboard/inventory"
                        permission={STORAGE_READ}
                        user={userForPermissions}
                    >
                        <Button variant="outline">Back to Dashboard</Button>
                    </PermissionLink>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="text-center p-12 border rounded-lg">
                    <h3 className="text-xl font-medium mb-2">No items in storage inventory</h3>
                    <p className="text-gray-500 mb-4">Start by adding items to your storage inventory.</p>
                    <PermissionLink
                        href="/dashboard/inventory/storage/new"
                        permission={STORAGE_CREATE}
                        user={userForPermissions}
                    >
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                    </PermissionLink>
                </div>
            ) : (
                <div className="space-y-8">
                    {sortedItemTypes.map(itemType => (
                        <div key={itemType} className="border rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-primary/10 px-4 py-3">
                                <h2 className="text-xl font-semibold">{itemType}</h2>
                            </div>
                            <div className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item Name</TableHead>
                                            <TableHead className="w-[150px]">Quantity</TableHead>
                                            <TableHead className="w-[150px]">Unit</TableHead>
                                            <TableHead className="w-[200px]">Remarks</TableHead>
                                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {groupedItems[ itemType ].map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>
                                                    {item.quantity > 0 ? (
                                                        item.quantity
                                                    ) : (
                                                        <Badge variant="destructive">Out of Stock</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>{item.unit || '-'}</TableCell>
                                                <TableCell>{item.remarks || '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <PermissionLink
                                                        href={`/dashboard/inventory/storage/${item.id}`}
                                                        permission={STORAGE_READ}
                                                        user={userForPermissions}
                                                    >
                                                        <Button variant="ghost" size="sm">View</Button>
                                                    </PermissionLink>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 