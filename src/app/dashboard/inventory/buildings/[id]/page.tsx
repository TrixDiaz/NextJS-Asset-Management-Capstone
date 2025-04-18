import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Building2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface BuildingDetailPageProps {
    params: {
        id: string;
    };
}

type Floor = {
    id: string;
    number: number;
    name: string | null;
    buildingId: string;
    createdAt: Date;
    updatedAt: Date;
    rooms: {
        id: string;
        number: string;
        name: string | null;
        type: string;
    }[];
};

type Building = {
    id: string;
    name: string;
    code: string | null;
    address: string | null;
    createdAt: Date;
    updatedAt: Date;
    floors: Floor[];
};

export default async function BuildingDetailPage({ params }: BuildingDetailPageProps) {
    const { id } = params;

    try {
        // Fetch building with related floors and rooms
        const building = await prisma.building.findUnique({
            where: { id },
            include: {
                floors: {
                    include: {
                        rooms: true
                    },
                    orderBy: {
                        number: 'asc'
                    }
                }
            }
        }) as Building | null;

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
                            <p className="text-muted-foreground">Address: {building.address}</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/dashboard/inventory/buildings/${id}/edit`}>
                            <Button variant="outline">Edit Building</Button>
                        </Link>
                        <Link href={`/dashboard/inventory/buildings/${id}/floors/new`}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Floor
                            </Button>
                        </Link>
                    </div>
                </div>

                {building.floors.length === 0 ? (
                    <div className="text-center p-12 border rounded-lg dark:border-gray-700">
                        <Building2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-medium mb-2">No floors added yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Start by adding floors to this building.</p>
                        <Link href={`/dashboard/inventory/buildings/${id}/floors/new`}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Floor
                            </Button>
                        </Link>
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
                                            <Link href={`/dashboard/inventory/floors/${floor.id}/rooms/new`}>
                                                <Button size="sm">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Room
                                                </Button>
                                            </Link>
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
    } catch (error) {
        console.error("Error in building detail page:", error);
        throw error;
    }
} 