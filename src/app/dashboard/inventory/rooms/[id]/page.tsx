import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Monitor, HardDrive, Cpu } from 'lucide-react';
import { notFound } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Define types
type AssetStatus = 'WORKING' | 'NEEDS_REPAIR' | 'OUT_OF_SERVICE' | 'UNDER_MAINTENANCE';
type AssetType = 'COMPUTER' | 'PRINTER' | 'PROJECTOR' | 'NETWORK_EQUIPMENT' | 'OTHER';

type Asset = {
    id: string;
    assetTag: string | null;
    assetType: AssetType;
    systemUnit: string | null;
    ups: string | null;
    monitor: string | null;
    status: AssetStatus;
    remarks: string | null;
    roomId: string;
    createdAt: Date;
    updatedAt: Date;
};

type Room = {
    id: string;
    number: string;
    name: string | null;
    type: string;
    floorId: string;
    floor: {
        id: string;
        number: number;
        name: string | null;
        buildingId: string;
        building: {
            id: string;
            name: string;
        }
    };
    assets: Asset[];
    createdAt: Date;
    updatedAt: Date;
};

// Helper function to get status badge variant
function getStatusBadge(status: AssetStatus) {
    switch (status) {
        case 'WORKING':
            return <Badge className="bg-green-500">Working</Badge>;
        case 'NEEDS_REPAIR':
            return <Badge className="bg-yellow-500">Needs Repair</Badge>;
        case 'OUT_OF_SERVICE':
            return <Badge className="bg-red-500">Out of Service</Badge>;
        case 'UNDER_MAINTENANCE':
            return <Badge className="bg-blue-500">Under Maintenance</Badge>;
        default:
            return <Badge>{status}</Badge>;
    }
}

export default async function RoomDetailPage({ params }: { params: { id: string } }) {
    try {
        const roomId = params.id;

        // Fetch room with relationships
        // @ts-ignore - Using type assertion to bypass TypeScript error
        const room = await (prisma.room as any).findUnique({
            where: { id: roomId },
            include: {
                floor: {
                    include: {
                        building: true
                    }
                },
                assets: true
            }
        }) as Room | null;

        if (!room) {
            notFound();
        }

        // Group assets by type
        const computerAssets = room.assets.filter(asset => asset.assetType === 'COMPUTER');
        const otherAssets = room.assets.filter(asset => asset.assetType !== 'COMPUTER');

        return (
            <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                    <Link href="/dashboard/inventory">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Buildings
                        </Button>
                    </Link>
                    <span className="text-gray-500">
                        {room.floor.building.name} &gt; Floor {room.floor.number} &gt; Room {room.number}
                    </span>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">
                        Room {room.number}
                        {room.name && <span className="ml-2 text-gray-500">({room.name})</span>}
                    </h1>
                    <div className="flex gap-2">
                        <Link href={`/dashboard/inventory/rooms/${room.id}/assets/new`}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Asset
                            </Button>
                        </Link>
                        <Link href={`/dashboard/inventory/rooms/${room.id}/edit`}>
                            <Button variant="outline">Edit Room</Button>
                        </Link>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Computer Assets Section */}
                    <div className="border rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-slate-100 px-4 py-3 flex items-center">
                            <Cpu className="mr-2 h-5 w-5" />
                            <h2 className="text-xl font-semibold">Computers</h2>
                        </div>

                        {computerAssets.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-gray-500">No computers found in this room</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Asset Tag</TableHead>
                                        <TableHead>System Unit</TableHead>
                                        <TableHead>Monitor</TableHead>
                                        <TableHead>UPS</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {computerAssets.map(asset => (
                                        <TableRow key={asset.id}>
                                            <TableCell className="font-medium">{asset.assetTag || 'N/A'}</TableCell>
                                            <TableCell>{asset.systemUnit || 'N/A'}</TableCell>
                                            <TableCell>{asset.monitor || 'N/A'}</TableCell>
                                            <TableCell>{asset.ups || 'N/A'}</TableCell>
                                            <TableCell>{getStatusBadge(asset.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/dashboard/inventory/assets/${asset.id}`}>
                                                    <Button variant="ghost" size="sm">View</Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    {/* Other Assets Section */}
                    {otherAssets.length > 0 && (
                        <div className="border rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-slate-100 px-4 py-3 flex items-center">
                                <HardDrive className="mr-2 h-5 w-5" />
                                <h2 className="text-xl font-semibold">Other Equipment</h2>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Asset Tag</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {otherAssets.map(asset => (
                                        <TableRow key={asset.id}>
                                            <TableCell className="font-medium">{asset.assetTag || 'N/A'}</TableCell>
                                            <TableCell>{asset.assetType}</TableCell>
                                            <TableCell>{asset.remarks || 'N/A'}</TableCell>
                                            <TableCell>{getStatusBadge(asset.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/dashboard/inventory/assets/${asset.id}`}>
                                                    <Button variant="ghost" size="sm">View</Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error in room detail page:", error);
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">Room Details</h1>
                <div className="bg-red-50 border border-red-300 p-4 rounded-md">
                    <p className="text-red-700">There was an error loading the room details. Please ensure the database is properly configured.</p>
                    <p className="text-sm text-red-500 mt-2">Error details: {error instanceof Error ? error.message : String(error)}</p>
                </div>
            </div>
        );
    }
} 