"use client";

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PermissionLink } from '@/components/auth/permission-link';
import { useUser } from '@clerk/nextjs';
import {
    BUILDING_CREATE,
    FLOOR_CREATE,
    STORAGE_READ,
    BUILDING_READ,
    BUILDING_UPDATE,
    BUILDING_DELETE
} from '@/constants/permissions';
import { useEffect, useState, useMemo } from 'react';
import { User } from '@/types/user';
import { usePermissions } from '@/hooks/use-permissions';

// Define building with related floors and rooms
type Building = {
    id: string;
    name: string;
    code: string | null;
    address: string | null;
    createdAt: Date;
    updatedAt: Date;
};

type Floor = {
    id: string;
    number: number;
    name: string | null;
    buildingId: string;
    createdAt: Date;
    updatedAt: Date;
};

type Room = {
    id: string;
    number: string;
    name: string | null;
    type: string;
    floorId: string;
    createdAt: Date;
    updatedAt: Date;
};

type BuildingWithRelations = Building & {
    floors: Array<Floor & {
        rooms: Array<Room>;
    }>;
};

// Define permission actions
type Permission = 'create' | 'edit' | 'delete' | 'read' | 'export';

export default function InventoryDashboard() {
    const { user } = useUser();
    const [ buildings, setBuildings ] = useState<BuildingWithRelations[]>([]);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ error, setError ] = useState<Error | null>(null);

    // Memoize the user object to prevent recreation on every render
    const userForPermissions = useMemo(() => {
        if (!user) return null;

        return {
            id: user.id,
            clerkId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.emailAddresses[ 0 ]?.emailAddress || null,
            profileImageUrl: user.imageUrl,
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date()
        } as User;
    }, [ user ]);

    // Get permissions from our hook
    const permissionsApi = usePermissions(userForPermissions);
    const { can } = permissionsApi;

    // Function to check if user has permission for a specific action
    const hasPermission = (action: Permission): boolean => {
        switch (action) {
            case 'create':
                return can(BUILDING_CREATE);
            case 'edit':
                return can(BUILDING_UPDATE);
            case 'delete':
                return can(BUILDING_DELETE);
            case 'read':
                return can(BUILDING_READ);
            case 'export':
                // Allow export for any user with READ permissions
                return userForPermissions?.role !== 'guest';
            default:
                return false;
        }
    };

    // Fetch buildings data
    useEffect(() => {
        const fetchBuildings = async () => {
            try {
                const response = await fetch('/api/buildings?include=floors,rooms');
                if (!response.ok) throw new Error('Failed to fetch buildings');
                const data = await response.json();
                setBuildings(data);
                setIsLoading(false);
            } catch (err) {
                console.error("Error in inventory dashboard:", err);
                setError(err instanceof Error ? err : new Error(String(err)));
                setIsLoading(false);
            }
        };

        fetchBuildings();
    }, []); // Empty dependency array to run only once on mount

    if (isLoading) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">Inventory Management System</h1>
                <div className="p-8 text-center">Loading inventory data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">Inventory Management System</h1>
                <div className="bg-red-50 border border-red-300 p-4 rounded-md">
                    <p className="text-red-700">There was an error loading the inventory. Please ensure the database is properly configured.</p>
                    <p className="text-sm text-red-500 mt-2">Error details: {error.message}</p>
                </div>
            </div>
        );
    }

    // Make sure we always have valid arrays to map over
    const buildingsData = buildings || [];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Inventory Management System</h1>
                <div className="flex gap-2">
                    <PermissionLink
                        href="/dashboard/inventory/buildings/new"
                        permission={BUILDING_CREATE}
                        user={userForPermissions}
                    >
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Building
                        </Button>
                    </PermissionLink>
                    <PermissionLink
                        href="/dashboard/inventory/storage"
                        permission={STORAGE_READ}
                        user={userForPermissions}
                    >
                        <Button variant="outline">Storage Inventory</Button>
                    </PermissionLink>
                    <PermissionLink
                        href="/dashboard/inventory/welcome"
                        user={userForPermissions}
                    >
                        <Button variant="secondary">Help & Guide</Button>
                    </PermissionLink>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {buildingsData.map((building) => (
                    <div key={building.id} className="border rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-primary bg-opacity-50 px-4 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold">{building.name}</h2>
                            <PermissionLink
                                href={`/dashboard/inventory/buildings/${building.id}`}
                                permission={BUILDING_READ}
                                user={userForPermissions}
                            >
                                <Button variant="ghost" size="sm">View Details</Button>
                            </PermissionLink>
                        </div>
                        <div className="p-4 space-y-4">
                            {!building.floors || building.floors.length === 0 ? (
                                <p className="text-gray-500 italic">No floors added yet</p>
                            ) : (
                                building.floors.map((floor) => (
                                    <div key={floor.id} className="space-y-2">
                                        <h3 className="text-lg font-medium border-b pb-1">
                                            Floor {floor.number} {floor.name && `- ${floor.name}`}
                                        </h3>
                                        {!floor.rooms || floor.rooms.length === 0 ? (
                                            <p className="text-gray-500 italic">No rooms added yet</p>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2">
                                                {floor.rooms.map((room) => (
                                                    <Link
                                                        key={room.id}
                                                        href={`/dashboard/inventory/rooms/${room.id}`}
                                                        className="block p-2 border rounded hover:bg-primary/10 transition-colors"
                                                    >
                                                        <div className="font-medium">Room {room.number}</div>
                                                        {room.name && <div className="text-sm text-gray-500">{room.name}</div>}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                            {building.floors && building.floors.length > 0 && (
                                <PermissionLink
                                    href={`/dashboard/inventory/buildings/${building.id}/floors/new`}
                                    permission={FLOOR_CREATE}
                                    user={userForPermissions}
                                >
                                    <Button variant="ghost" size="sm" className="mt-2">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Floor
                                    </Button>
                                </PermissionLink>
                            )}
                        </div>
                    </div>
                ))}

                {buildingsData.length === 0 && (
                    <div className="col-span-3 text-center p-12 border rounded-lg">
                        <h3 className="text-xl font-medium mb-2">No buildings found</h3>
                        <p className="text-gray-500 mb-4">Start by adding your first building to the system.</p>
                        <PermissionLink
                            href="/dashboard/inventory/buildings/new"
                            permission={BUILDING_CREATE}
                            user={userForPermissions}
                        >
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Building
                            </Button>
                        </PermissionLink>
                    </div>
                )}
            </div>
        </div>
    );
} 