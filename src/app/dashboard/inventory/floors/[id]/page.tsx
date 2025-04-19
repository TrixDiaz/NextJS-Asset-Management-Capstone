"use client";

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
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

interface FloorDetailPageProps {
    params: {
        id: string;
    };
}

type Room = {
    id: string;
    number: string;
    name: string | null;
    type: string;
};

type Floor = {
    id: string;
    number: number;
    name: string | null;
    buildingId: string;
    createdAt: string;
    updatedAt: string;
    rooms: Room[];
    building: {
        id: string;
        name: string;
    };
};

export default function FloorDetailPage({ params }: FloorDetailPageProps) {
    const { id } = params;
    const [ floor, setFloor ] = useState<Floor | null>(null);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<Error | null>(null);

    useEffect(() => {
        const fetchFloorData = async () => {
            try {
                setLoading(true);
                // Fetch floor data with rooms and building info
                const response = await fetch(`/api/floors/${id}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setLoading(false);
                        return; // Will render not found UI
                    }
                    throw new Error('Failed to fetch floor data');
                }

                const floorData = await response.json();

                // Store floor name and building name in localStorage for breadcrumbs
                const floorName = floorData.name
                    ? `Floor ${floorData.number} - ${floorData.name}`
                    : `Floor ${floorData.number}`;
                setEntityNameInStorage('floor', id, floorName);
                setEntityNameInStorage('building', floorData.buildingId, floorData.building.name);

                setFloor(floorData);
                setLoading(false);
            } catch (error) {
                console.error("Error in floor detail page:", error);
                setError(error instanceof Error ? error : new Error('Unknown error'));
                setLoading(false);
            }
        };

        fetchFloorData();
    }, [ id ]);

    if (loading) {
        return <div className="container p-6">Loading floor details...</div>;
    }

    if (error) {
        return <div className="container p-6">Error: {error.message}</div>;
    }

    if (!floor) {
        notFound();
    }

    return (
        <div className="container w-full p-6">
            <div className="flex items-center mb-4">
                <Link href={`/dashboard/inventory/buildings/${floor.buildingId}`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to {floor.building.name}
                    </Button>
                </Link>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">
                        Floor {floor.number}
                        {floor.name && <span className="ml-2 text-gray-500 dark:text-gray-400">({floor.name})</span>}
                    </h1>
                    <p className="text-muted-foreground">Building: {floor.building.name}</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/dashboard/inventory/floors/${id}/edit`}>
                        <Button variant="outline">Edit Floor</Button>
                    </Link>
                    <Link href={`/dashboard/inventory/floors/${id}/rooms/new`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Room
                        </Button>
                    </Link>
                </div>
            </div>

            {floor.rooms.length === 0 ? (
                <div className="text-center p-12 border rounded-lg">
                    <h3 className="text-lg font-medium mb-2">No Rooms Added Yet</h3>
                    <p className="text-muted-foreground mb-4">
                        Start by adding rooms to this floor
                    </p>
                    <Link href={`/dashboard/inventory/floors/${id}/rooms/new`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add First Room
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {floor.rooms.map((room) => (
                        <Link href={`/dashboard/inventory/rooms/${room.id}`} key={room.id}>
                            <Card className="h-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="flex justify-between">
                                        <span>Room {room.number}</span>
                                    </CardTitle>
                                    {room.name && (
                                        <CardDescription>{room.name}</CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm font-medium">{room.type}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
} 