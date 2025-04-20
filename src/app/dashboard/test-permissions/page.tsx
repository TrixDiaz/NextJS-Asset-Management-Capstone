'use client';

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PERMISSION_GROUPS, PERMISSION_DISPLAY_NAMES } from "@/constants/permissions";
import { usePermissions } from "@/hooks/use-permissions";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { PermissionButton } from "@/components/auth/permission-button";
import { PermissionLink } from "@/components/auth/permission-link";
import {
    User,
    Database,
    TicketCheck,
    Kanban,
    Calendar,
    FileBarChart,
    HardDrive,
    Building,
    LayoutDashboard,
    Pen,
    Trash2,
    Plus
} from "lucide-react";

export default function TestPermissionsPage() {
    const [ testRole, setTestRole ] = useState<string>('member');

    // Use useMemo to prevent creating a new object on every render
    const testUser = useMemo(() => ({
        id: `test-${testRole}`,
        clerkId: `test-${testRole}`,
        firstName: testRole.charAt(0).toUpperCase() + testRole.slice(1),
        lastName: 'Test',
        username: testRole,
        email: `${testRole}@example.com`,
        role: testRole as any,
        permissions: [],
        profileImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
    }), [ testRole ]);

    // Use our permissions hook with the test user
    const {
        can,
        canShowCreateButton,
        canShowEditButton,
        canShowDeleteButton,
        isAdmin,
        isTechnician,
        isMember,
        canManage
    } = usePermissions(testUser);

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-8">Test Permissions</h1>

            <div className="grid gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Select Role to Test</CardTitle>
                        <CardDescription>
                            Choose a role to test permissions. This will simulate a user with that role.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Select value={testRole} onValueChange={setTestRole}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin (Head)</SelectItem>
                                    <SelectItem value="technician">Technician (Moderator)</SelectItem>
                                    <SelectItem value="member">Member (Professor)</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button onClick={handleRefresh} variant="outline">Refresh</Button>
                        </div>

                        <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="font-semibold w-40">Current Role:</div>
                                <div>{testUser.firstName} {testUser.lastName} ({testUser.role})</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="font-semibold w-40">Is Admin:</div>
                                <div>{isAdmin() ? 'Yes' : 'No'}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="font-semibold w-40">Is Technician:</div>
                                <div>{isTechnician() ? 'Yes' : 'No'}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="font-semibold w-40">Is Member:</div>
                                <div>{isMember() ? 'Yes' : 'No'}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="font-semibold w-40">Can Manage:</div>
                                <div>{canManage() ? 'Yes' : 'No'}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Button Permission Tests</CardTitle>
                        <CardDescription>
                            These buttons will only show if the user has the correct permissions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="p-4">
                                    <CardTitle className="text-base">Create Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 space-y-2">
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {canShowCreateButton() ? 'You can see CREATE buttons' : 'CREATE buttons are hidden'}
                                    </p>

                                    <PermissionButton
                                        user={testUser}
                                        actionType="create"
                                        className="w-full"
                                        onClick={() => toast.success("Create clicked!")}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Resource
                                    </PermissionButton>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="p-4">
                                    <CardTitle className="text-base">Edit Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 space-y-2">
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {canShowEditButton() ? 'You can see EDIT buttons' : 'EDIT buttons are hidden'}
                                    </p>

                                    <PermissionButton
                                        user={testUser}
                                        actionType="edit"
                                        className="w-full"
                                        onClick={() => toast.success("Edit clicked!")}
                                    >
                                        <Pen className="h-4 w-4 mr-2" />
                                        Edit Resource
                                    </PermissionButton>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="p-4">
                                    <CardTitle className="text-base">Delete Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 space-y-2">
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {canShowDeleteButton() ? 'You can see DELETE buttons' : 'DELETE buttons are hidden'}
                                    </p>

                                    <PermissionButton
                                        user={testUser}
                                        actionType="delete"
                                        variant="destructive"
                                        className="w-full"
                                        onClick={() => toast.success("Delete clicked!")}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Resource
                                    </PermissionButton>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Resource Permission Tests</CardTitle>
                        <CardDescription>
                            Tests permissions for individual resources.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                            {PERMISSION_GROUPS.map(group => (
                                <Card key={group.name}>
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-base flex items-center">
                                            {getResourceIcon(group.name)}
                                            <span className="ml-2">{group.name}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 space-y-2">
                                        {group.permissions.map(permCode => (
                                            <div key={permCode} className="flex items-center space-x-2">
                                                <Checkbox id={permCode} checked={can(permCode)} disabled />
                                                <label htmlFor={permCode} className="text-sm">
                                                    {PERMISSION_DISPLAY_NAMES[ permCode ]}
                                                </label>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Helper function to get an icon for each resource
function getResourceIcon(resourceName: string) {
    switch (resourceName) {
        case 'User Management':
            return <User className="h-4 w-4" />;
        case 'Logs':
            return <Database className="h-4 w-4" />;
        case 'Ticketing':
            return <TicketCheck className="h-4 w-4" />;
        case 'Kanban':
            return <Kanban className="h-4 w-4" />;
        case 'Scheduling':
            return <Calendar className="h-4 w-4" />;
        case 'Reports':
            return <FileBarChart className="h-4 w-4" />;
        case 'Storage':
            return <HardDrive className="h-4 w-4" />;
        case 'Buildings':
            return <Building className="h-4 w-4" />;
        case 'Floors':
        case 'Rooms':
            return <LayoutDashboard className="h-4 w-4" />;
        default:
            return <Database className="h-4 w-4" />;
    }
} 