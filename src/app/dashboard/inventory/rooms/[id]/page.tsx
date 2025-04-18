import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Calendar, User, Edit } from 'lucide-react';
import { notFound } from 'next/navigation';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface RoomDetailPageProps {
    params: {
        id: string;
    };
}

interface DeploymentItem {
    id: string;
    name: string;
    itemType: string;
    subType: string | null;
    unit: string | null;
    deployments: {
        id: string;
        quantity: number;
        serialNumber: string | null;
        date: Date;
        deployedBy: string;
        remarks: string | null;
    }[];
}

interface Room {
    id: string;
    number: string;
    name: string | null;
    type: string | null;
    floor: {
        id: string;
        number: number;
        name: string | null;
        building: {
            id: string;
            name: string;
        }
    }
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
    const id = params.id;

    try {
        // Fetch room with floor and building details
        const room = await prisma.room.findUnique({
            where: { id },
            include: {
                floor: {
                    include: {
                        building: true
                    }
                }
            }
        }) as Room | null;

        if (!room) {
            notFound();
        }

        // Fetch all deployment records for this room
        const deployments = await prisma.$queryRaw`
            SELECT 
                dr.id, 
                dr.quantity, 
                dr."serialNumber", 
                dr.date, 
                dr."deployedBy", 
                dr.remarks,
                si.id as "storageItemId",
                si.name as "storageItemName",
                si."itemType", 
                si."subType",
                si.unit
            FROM "DeploymentRecord" dr
            JOIN "StorageItem" si ON dr."storageItemId" = si.id
            WHERE dr."toRoomId" = ${id}
            ORDER BY dr.date DESC
        `;

        // Group deployments by storage item for better organization
        const deploymentsByItem: Record<string, DeploymentItem> = {};
        (deployments as any[]).forEach(deployment => {
            const itemId = deployment.storageItemId as string;

            if (!deploymentsByItem[ itemId ]) {
                deploymentsByItem[ itemId ] = {
                    id: deployment.storageItemId,
                    name: deployment.storageItemName,
                    itemType: deployment.itemType,
                    subType: deployment.subType,
                    unit: deployment.unit,
                    deployments: []
                };
            }

            deploymentsByItem[ itemId ].deployments.push({
                id: deployment.id,
                quantity: deployment.quantity,
                serialNumber: deployment.serialNumber,
                date: deployment.date,
                deployedBy: deployment.deployedBy,
                remarks: deployment.remarks
            });
        });

        return (
            <div className="container p-6">
                <div className="flex items-center mb-4">
                    <Link href="/dashboard/inventory/rooms">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Rooms
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-2xl font-bold">Room Details</CardTitle>
                                <Link href={`/dashboard/inventory/rooms/${id}/edit`}>
                                    <Button size="sm" variant="outline">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Room
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Room Number</dt>
                                        <dd className="mt-1 text-lg">{room.number}</dd>
                                    </div>
                                    {room.name && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Room Name</dt>
                                            <dd className="mt-1 text-lg">{room.name}</dd>
                                        </div>
                                    )}
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Building</dt>
                                        <dd className="mt-1">{room.floor.building.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Floor</dt>
                                        <dd className="mt-1">{`${room.floor.name || `Floor ${room.floor.number}`}`}</dd>
                                    </div>
                                    {room.type && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Room Type</dt>
                                            <dd className="mt-1">
                                                <Badge variant="outline">{room.type}</Badge>
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Package className="h-5 w-5 mr-2" />
                                    Deployed Assets
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(deploymentsByItem).length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500 mb-4">No assets deployed to this room yet</p>
                                        <Link href="/dashboard/inventory/storage">
                                            <Button>
                                                Deploy Assets to Room
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-4 flex justify-end">
                                            <Link href="/dashboard/inventory/storage">
                                                <Button>
                                                    Deploy More Assets
                                                </Button>
                                            </Link>
                                        </div>
                                        <div className="space-y-8">
                                            {Object.values(deploymentsByItem).map((item: DeploymentItem) => (
                                                <div key={item.id} className="border-b pb-6 last:border-0">
                                                    <h3 className="text-lg font-medium mb-2">
                                                        <Link href={`/dashboard/inventory/storage/${item.id}`} className="text-blue-600 hover:underline">
                                                            {item.name}
                                                        </Link>
                                                        <span className="ml-2 text-sm text-gray-500">
                                                            {item.itemType}{item.subType && ` (${item.subType})`}
                                                        </span>
                                                    </h3>

                                                    <div className="space-y-4 mt-3">
                                                        {item.deployments.map((deployment) => (
                                                            <div key={deployment.id} className="bg-muted rounded-md p-3">
                                                                <div className="flex flex-wrap justify-between items-center mb-2">
                                                                    <span className="font-medium">
                                                                        {deployment.quantity} {item.unit || 'units'}
                                                                    </span>
                                                                    <div className="flex items-center text-sm text-gray-500">
                                                                        <Calendar className="h-3.5 w-3.5 mr-1" />
                                                                        {format(new Date(deployment.date), 'PPP p')}
                                                                    </div>
                                                                </div>

                                                                {deployment.serialNumber && (
                                                                    <div className="text-sm my-1">
                                                                        Serial: <Badge variant="outline">{deployment.serialNumber}</Badge>
                                                                    </div>
                                                                )}

                                                                <div className="text-sm flex items-center">
                                                                    <User className="h-3.5 w-3.5 mr-1" />
                                                                    Deployed by: {deployment.deployedBy}
                                                                </div>

                                                                {deployment.remarks && (
                                                                    <div className="text-sm text-gray-600 mt-1 italic">
                                                                        &ldquo;{deployment.remarks}&rdquo;
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error in room detail:", error);
        throw error;
    }
} 