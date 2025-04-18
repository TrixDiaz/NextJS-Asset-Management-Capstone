import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Building } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function RoomsIndexPage() {
    try {
        // Get all rooms with their relationships
        const rooms = await prisma.$queryRaw`
            SELECT 
                r.id, 
                r.number, 
                r.name, 
                r."type", 
                f.number as "floorNumber", 
                b.name as "buildingName",
                COUNT(dr.id) as "deploymentCount"
            FROM "Room" r
            JOIN "Floor" f ON r."floorId" = f.id
            JOIN "Building" b ON f."buildingId" = b.id
            LEFT JOIN "DeploymentRecord" dr ON dr."toRoomId" = r.id
            GROUP BY r.id, r.number, r.name, r."type", f.number, b.name
            ORDER BY b.name, f.number, r.number
        `;

        return (
            <div className="container p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Rooms</h1>
                    <Link href="/dashboard/inventory/rooms/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Room
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Building className="h-5 w-5 mr-2" />
                            All Rooms
                        </CardTitle>
                        <CardDescription>
                            View and manage all rooms across your buildings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {(rooms as any[]).length === 0 ? (
                            <div className="text-center py-6">
                                <p className="text-gray-500 mb-4">No rooms found</p>
                                <Link href="/dashboard/inventory/seed">
                                    <Button variant="outline">
                                        Create Sample Data
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Building</TableHead>
                                        <TableHead>Floor</TableHead>
                                        <TableHead>Room</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Deployed Assets</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(rooms as any[]).map((room) => (
                                        <TableRow key={room.id}>
                                            <TableCell>{room.buildingName}</TableCell>
                                            <TableCell>Floor {room.floorNumber}</TableCell>
                                            <TableCell>
                                                {room.number}
                                                {room.name && <span className="text-gray-500 ml-2">({room.name})</span>}
                                            </TableCell>
                                            <TableCell>
                                                {room.type ? (
                                                    <Badge variant="outline">{room.type}</Badge>
                                                ) : (
                                                    <span className="text-gray-500">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{room.deploymentCount}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/dashboard/inventory/rooms/${room.id}`}>
                                                    <Button variant="ghost" size="sm">View</Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    } catch (error) {
        console.error("Error loading rooms:", error);
        return (
            <div className="container p-6">
                <h1 className="text-3xl font-bold mb-6">Rooms</h1>
                <div className="bg-red-50 border border-red-300 p-4 rounded-md">
                    <p className="text-red-700">There was an error loading the rooms. Please try again later.</p>
                </div>
            </div>
        );
    }
} 