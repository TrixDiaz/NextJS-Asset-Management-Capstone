'use client';

import { useState, useEffect } from 'react';
import { ResourcePermissionWrapper, ResourceActionButtons } from '@/components/permissions/resource-permission-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { User } from '@/types/user';
import { usePermissions } from '@/hooks/use-permissions';
import { LOGS_READ } from '@/constants/permissions';

// Define permission actions
type Permission = 'read' | 'export';

interface LogEntry {
    id: string;
    user: string;
    action: string;
    resource: string;
    resourceId: string;
    details: string;
    timestamp: string;
}

export default function LogsPage() {
    const [ logs, setLogs ] = useState<LogEntry[]>([]);
    const [ isLoading, setIsLoading ] = useState(true);
    const { user } = useUser();

    // Create user object for permission checks
    const userForPermissions: User | null = user ? {
        id: user.id,
        clerkId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.emailAddresses?.[ 0 ]?.emailAddress || null,
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
            case 'read':
                return can(LOGS_READ);
            case 'export':
                // Allow export for any user with READ permissions
                return userForPermissions?.role !== 'guest';
            default:
                return false;
        }
    };

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                // In a real app, you would fetch from your API
                // Simulated data for demo
                const mockLogs: LogEntry[] = [
                    {
                        id: '1',
                        user: 'admin',
                        action: 'CREATE',
                        resource: 'USER',
                        resourceId: 'user-123',
                        details: 'Created new user john.doe',
                        timestamp: new Date().toISOString()
                    },
                    {
                        id: '2',
                        user: 'technician',
                        action: 'UPDATE',
                        resource: 'BUILDING',
                        resourceId: 'building-456',
                        details: 'Updated building name to "Science Center"',
                        timestamp: new Date().toISOString()
                    },
                    {
                        id: '3',
                        user: 'member',
                        action: 'READ',
                        resource: 'ROOM',
                        resourceId: 'room-789',
                        details: 'Viewed room details',
                        timestamp: new Date().toISOString()
                    },
                    {
                        id: '4',
                        user: 'admin',
                        action: 'DELETE',
                        resource: 'FLOOR',
                        resourceId: 'floor-101',
                        details: 'Deleted floor record',
                        timestamp: new Date().toISOString()
                    }
                ];

                setLogs(mockLogs);
            } catch (error) {
                console.error('Error fetching logs:', error);
                toast.error('Failed to load logs');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, []);

    // Get badge variant based on action type
    const getActionBadge = (action: string) => {
        switch (action) {
            case 'CREATE':
                return 'default';
            case 'READ':
                return 'outline';
            case 'UPDATE':
                return 'secondary';
            case 'DELETE':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    // Filter logs by action type for tabs
    const filterLogs = (action: string | null) => {
        if (!action) return logs;
        return logs.filter(log => log.action === action);
    };

    return (
        <ResourcePermissionWrapper
            resourceType="logs"
            title="System Logs"
            showCreateButton={false}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Activity Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-4">Loading logs...</div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground">No logs found</p>
                        </div>
                    ) : (
                        <Tabs defaultValue="all">
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="CREATE">Create</TabsTrigger>
                                <TabsTrigger value="READ">Read</TabsTrigger>
                                <TabsTrigger value="UPDATE">Update</TabsTrigger>
                                <TabsTrigger value="DELETE">Delete</TabsTrigger>
                            </TabsList>

                            {[ 'all', 'CREATE', 'READ', 'UPDATE', 'DELETE' ].map(tab => (
                                <TabsContent key={tab} value={tab}>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Action</TableHead>
                                                <TableHead>Resource</TableHead>
                                                <TableHead>Details</TableHead>
                                                <TableHead>Timestamp</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filterLogs(tab === 'all' ? null : tab).map((log) => (
                                                <TableRow key={log.id}>
                                                    <TableCell className="font-medium">{log.user}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getActionBadge(log.action)}>
                                                            {log.action.toLowerCase()}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{log.resource}</TableCell>
                                                    <TableCell>{log.details}</TableCell>
                                                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                                    <TableCell className="text-right">
                                                        {/* No action buttons since only read permission exists */}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TabsContent>
                            ))}
                        </Tabs>
                    )}
                </CardContent>
            </Card>
        </ResourcePermissionWrapper>
    );
} 