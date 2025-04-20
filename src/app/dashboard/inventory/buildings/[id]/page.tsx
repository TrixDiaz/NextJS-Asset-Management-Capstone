"use client";

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { setEntityNameInStorage } from '@/hooks/use-breadcrumbs';
import * as React from 'react';
import { useUser } from '@clerk/nextjs';
import { User } from '@/types/user';
import { usePermissions } from '@/hooks/use-permissions';
import { PermissionLink } from '@/components/auth/permission-link';
import {
    BUILDING_UPDATE,
    FLOOR_CREATE
} from '@/constants/permissions';

interface BuildingDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

type Building = {
    id: string;
    name: string;
    code: string | null;
    address: string | null;
    createdAt: string;
    updatedAt: string;
    floors: Floor[];
};

type Floor = {
    id: string;
    number: number;
    name: string | null;
    buildingId: string;
    createdAt: string;
    updatedAt: string;
    rooms: {
        id: string;
        number: string;
        name: string | null;
        type: string;
    }[];
};

export default function BuildingDetailPage({ params }: BuildingDetailPageProps) {
    const unwrappedParams = React.use(params);
    const id = unwrappedParams.id;
    const [ building, setBuilding ] = useState<Building | null>(null);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<Error | null>(null);
    const { user } = useUser();

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

    // Check if user can edit building or add floor
    const canEditBuilding = can(BUILDING_UPDATE);
    const canAddFloor = can(FLOOR_CREATE);

    useEffect(() => {
        const fetchBuildingData = async () => {
            try {
                setLoading(true);
                // Fetch building data with floors and rooms
                const response = await fetch(`/api/buildings/${id}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setLoading(false);
                        return; // Will render not found UI
                    }
                    throw new Error('Failed to fetch building data');
                }

                const buildingData = await response.json();

                // Store building name in localStorage for breadcrumbs
                setEntityNameInStorage('building', id, buildingData.name);

                setBuilding(buildingData);
                setLoading(false);
            } catch (error) {
                console.error("Error in building detail page:", error);
                setError(error instanceof Error ? error : new Error('Unknown error'));
                setLoading(false);
            }
        };

        fetchBuildingData();
    }, [ id ]);

    if (loading) {
        return <div className="container p-6">Loading building details...</div>;
    }

    if (error) {
        return <div className="container p-6">Error: {error.message}</div>;
    }

    if (!building) {
        notFound();
    }

    return (
        <div className="container w-full p-6">
            <div className="flex items-center mb-4">
                <Link href="/dashboard/inventory">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Inventory
                    </Button>
                </Link>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{building.name}</h1>
                    {building.code && (
                        <p className="text-muted-foreground">Code: {building.code}</p>
                    )}
                    {building.address && (
                        <p className="text-muted-foreground">{building.address}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    {canEditBuilding && (
                        <Link href={`/dashboard/inventory/buildings/${id}/edit`}>
                            <Button variant="outline">Edit Building</Button>
                        </Link>
                    )}
                    {canAddFloor && (
                        <Link href={`/dashboard/inventory/buildings/${id}/floors/new`}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Floor
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {building.floors.length === 0 ? (
                <div className="text-center p-12 border rounded-lg">
                    <h3 className="text-lg font-medium mb-2">No Floors Added Yet</h3>
                    <p className="text-muted-foreground mb-4">
                        Start by adding floors to this building
                    </p>
                    {canAddFloor && (
                        <Link href={`/dashboard/inventory/buildings/${id}/floors/new`}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add First Floor
                            </Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid gap-6">
                    {building.floors.map((floor) => (
                        <Card key={floor.id} className="dark:border-gray-700">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                    <CardTitle>
                                        Floor {floor.number}
                                        {floor.name && ` - ${floor.name}`}
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        <PermissionLink
                                            href={`/dashboard/inventory/floors/${floor.id}/rooms/new`}
                                            permission={FLOOR_CREATE}
                                            user={userForPermissions}
                                        >
                                            <Button size="sm">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Room
                                            </Button>
                                        </PermissionLink>
                                        <Link href={`/dashboard/inventory/floors/${floor.id}`}>
                                            <Button variant="outline" size="sm">View Details</Button>
                                        </Link>
                                    </div>
                                </div>
                                <CardDescription>
                                    {floor.rooms.length} room{floor.rooms.length !== 1 ? 's' : ''}
                                </CardDescription>
                            </CardHeader>

                            {floor.rooms.length > 0 && (
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {floor.rooms.map((room) => (
                                            <Link
                                                href={`/dashboard/inventory/rooms/${room.id}`}
                                                key={room.id}
                                                className="p-3 border rounded-md hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <div className="font-medium">Room {room.number}</div>
                                                {room.name && (
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{room.name}</div>
                                                )}
                                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{room.type}</div>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 