'use client';

import { useState, useEffect } from 'react';
import { ResourcePermissionWrapper, ResourceActionButtons } from '@/components/permissions/resource-permission-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Room {
    id: string;
    name: string;
    number: string;
    capacity: number;
    type: string;
    floorId: string;
    floorName: string;
    buildingName: string;
    createdAt: string;
}

export default function RoomsPage() {
    const [ rooms, setRooms ] = useState<Room[]>([]);
    const [ isLoading, setIsLoading ] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            setIsLoading(true);
            try {
                // In a real app, you would fetch from your API
                // Simulated data for demo
                const mockRooms: Room[] = [
                    {
                        id: '1',
                        name: 'Conference Room',
                        number: '101',
                        capacity: 20,
                        type: 'CONFERENCE',
                        floorId: '1',
                        floorName: 'First Floor',
                        buildingName: 'Main Campus Building',
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: '2',
                        name: 'Lecture Hall',
                        number: '201',
                        capacity: 100,
                        type: 'CLASSROOM',
                        floorId: '2',
                        floorName: 'Second Floor',
                        buildingName: 'Main Campus Building',
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: '3',
                        name: 'Lab Room',
                        number: '101',
                        capacity: 30,
                        type: 'LABORATORY',
                        floorId: '3',
                        floorName: 'Ground Floor',
                        buildingName: 'Science Center',
                        createdAt: new Date().toISOString()
                    }
                ];

                setRooms(mockRooms);
            } catch (error) {
                console.error('Error fetching rooms:', error);
                toast.error('Failed to load rooms');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRooms();
    }, []);

    const handleDeleteRoom = (id: string) => {
        // Normally you would call your API to delete the room
        toast.success(`Would delete room ${id} (demo only)`);

        // Update local state to remove the room
        setRooms(prev => prev.filter(room => room.id !== id));
    };

    // Get the appropriate badge color based on room type
    const getRoomTypeBadge = (type: string) => {
        switch (type) {
            case 'CLASSROOM':
                return 'default';
            case 'LABORATORY':
                return 'secondary';
            case 'CONFERENCE':
                return 'outline';
            case 'OFFICE':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <ResourcePermissionWrapper
            resourceType="room"
            title="Rooms"
            createHref="/dashboard/rooms/new"
        >
            <Card>
                <CardHeader>
                    <CardTitle>All Rooms</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-4">Loading rooms...</div>
                    ) : rooms.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground">No rooms found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name & Number</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rooms.map((room) => (
                                    <TableRow key={room.id}>
                                        <TableCell className="font-medium">
                                            {room.name}
                                            <div className="text-sm text-muted-foreground">#{room.number}</div>
                                        </TableCell>
                                        <TableCell>{room.capacity} people</TableCell>
                                        <TableCell>
                                            <Badge variant={getRoomTypeBadge(room.type) as any}>
                                                {room.type.toLowerCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {room.floorName}, {room.buildingName}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <ResourceActionButtons
                                                resourceType="room"
                                                editHref={`/dashboard/rooms/${room.id}/edit`}
                                                onDelete={() => handleDeleteRoom(room.id)}
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