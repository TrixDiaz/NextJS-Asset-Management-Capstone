'use client';

import { useState, useEffect } from 'react';
import { ResourcePermissionWrapper, ResourceActionButtons } from '@/components/permissions/resource-permission-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Building {
    id: string;
    name: string;
    code: string;
    address: string;
    createdAt: string;
}

export default function BuildingsPage() {
    const [ buildings, setBuildings ] = useState<Building[]>([]);
    const [ isLoading, setIsLoading ] = useState(true);

    useEffect(() => {
        const fetchBuildings = async () => {
            setIsLoading(true);
            try {
                // In a real app, you would fetch from your API
                // Simulated data for demo
                const mockBuildings: Building[] = [
                    {
                        id: '1',
                        name: 'Main Campus Building',
                        code: 'MCB',
                        address: '123 University Ave',
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: '2',
                        name: 'Science Center',
                        code: 'SC',
                        address: '456 Research Dr',
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: '3',
                        name: 'Library',
                        code: 'LIB',
                        address: '789 Reading Ln',
                        createdAt: new Date().toISOString()
                    }
                ];

                setBuildings(mockBuildings);
            } catch (error) {
                console.error('Error fetching buildings:', error);
                toast.error('Failed to load buildings');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBuildings();
    }, []);

    const handleDeleteBuilding = (id: string) => {
        // Normally you would call your API to delete the building
        toast.success(`Would delete building ${id} (demo only)`);

        // Update local state to remove the building
        setBuildings(prev => prev.filter(building => building.id !== id));
    };

    return (
        <ResourcePermissionWrapper
            resourceType="building"
            title="Buildings"
            createHref="/dashboard/buildings/new"
        >
            <Card>
                <CardHeader>
                    <CardTitle>All Buildings</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-4">Loading buildings...</div>
                    ) : buildings.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground">No buildings found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {buildings.map((building) => (
                                    <TableRow key={building.id}>
                                        <TableCell className="font-medium">{building.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{building.code}</Badge>
                                        </TableCell>
                                        <TableCell>{building.address}</TableCell>
                                        <TableCell className="text-right">
                                            <ResourceActionButtons
                                                resourceType="building"
                                                editHref={`/dashboard/buildings/${building.id}/edit`}
                                                onDelete={() => handleDeleteBuilding(building.id)}
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