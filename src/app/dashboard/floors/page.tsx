'use client';

import { useState, useEffect } from 'react';
import { ResourcePermissionWrapper, ResourceActionButtons } from '@/components/permissions/resource-permission-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { usePermissions } from '@/hooks/use-permissions';
import { User } from '@/types/user';
import {
    FLOOR_CREATE,
    FLOOR_READ,
    FLOOR_UPDATE,
    FLOOR_DELETE
} from '@/constants/permissions';

interface Floor {
    id: string;
    name: string;
    number: number;
    buildingId: string;
    buildingName: string;
    createdAt: string;
}

// Define permission actions
type Permission = 'create' | 'edit' | 'delete' | 'read' | 'export';

export default function FloorsPage() {
    const [ floors, setFloors ] = useState<Floor[]>([]);
    const [ isLoading, setIsLoading ] = useState(true);
    const { user } = useUser();

    // Create user object for permission checks
    const userForPermissions: User | null = user ? {
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
                return can(FLOOR_CREATE);
            case 'edit':
                return can(FLOOR_UPDATE);
            case 'delete':
                return can(FLOOR_DELETE);
            case 'read':
                return can(FLOOR_READ);
            case 'export':
                // Allow export for any user with READ permissions
                return userForPermissions?.role !== 'guest';
            default:
                return false;
        }
    };

    useEffect(() => {
        const fetchFloors = async () => {
            setIsLoading(true);
            try {
                // In a real app, you would fetch from your API
                // Simulated data for demo
                const mockFloors: Floor[] = [
                    {
                        id: '1',
                        name: 'First Floor',
                        number: 1,
                        buildingId: '1',
                        buildingName: 'Main Campus Building',
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: '2',
                        name: 'Second Floor',
                        number: 2,
                        buildingId: '1',
                        buildingName: 'Main Campus Building',
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: '3',
                        name: 'Ground Floor',
                        number: 0,
                        buildingId: '2',
                        buildingName: 'Science Center',
                        createdAt: new Date().toISOString()
                    }
                ];

                setFloors(mockFloors);
            } catch (error) {
                console.error('Error fetching floors:', error);
                toast.error('Failed to load floors');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFloors();
    }, []);

    const handleDeleteFloor = (id: string) => {
        // Normally you would call your API to delete the floor
        toast.success(`Would delete floor ${id} (demo only)`);

        // Update local state to remove the floor
        setFloors(prev => prev.filter(floor => floor.id !== id));
    };

    return (
        <ResourcePermissionWrapper
            resourceType="floor"
            title="Floors"
            createHref="/dashboard/floors/new"
        >
            <Card>
                <CardHeader>
                    <CardTitle>All Floors</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-4">Loading floors...</div>
                    ) : floors.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground">No floors found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Number</TableHead>
                                    <TableHead>Building</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {floors.map((floor) => (
                                    <TableRow key={floor.id}>
                                        <TableCell className="font-medium">{floor.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{floor.number}</Badge>
                                        </TableCell>
                                        <TableCell>{floor.buildingName}</TableCell>
                                        <TableCell className="text-right">
                                            <ResourceActionButtons
                                                resourceType="floor"
                                                editHref={`/dashboard/floors/${floor.id}/edit`}
                                                onDelete={() => handleDeleteFloor(floor.id)}
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