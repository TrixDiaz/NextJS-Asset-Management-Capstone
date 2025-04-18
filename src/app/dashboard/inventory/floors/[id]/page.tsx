import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, LayoutGrid } from 'lucide-react';
import { notFound } from 'next/navigation';

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
    floorId: string;
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
    rooms: Room[];
    building: {
        id: string;
        name: string;
    };
};

export default async function FloorDetailPage({ params }: FloorDetailPageProps) {
    const { id } = params;

    try {
        // Fetch floor with related rooms and building
        const floor = await prisma.floor.findUnique({
            where: { id },
            include: {
                rooms: {
                    orderBy: {
                        number: 'asc'
                    }
                },
                building: true
            }
        }) as Floor | null;

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
                    <div className="text-center p-12 border rounded-lg dark:border-gray-700">
                        <LayoutGrid className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-medium mb-2">No rooms added yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Start by adding rooms to this floor.</p>
                        <Link href={`/dashboard/inventory/floors/${id}/rooms/new`}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Room
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {floor.rooms.map((room) => (
                            <Link
                                href={`/dashboard/inventory/rooms/${room.id}`}
                                key={room.id}
                                className="block p-4 border rounded-lg hover:border-primary hover:shadow-sm transition-all dark:border-gray-700 dark:hover:border-primary"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-xl font-semibold">Room {room.number}</h2>
                                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full">
                                        {room.type}
                                    </span>
                                </div>
                                {room.name && (
                                    <p className="text-gray-600 dark:text-gray-400">{room.name}</p>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error("Error in floor detail page:", error);
        throw error;
    }
} 