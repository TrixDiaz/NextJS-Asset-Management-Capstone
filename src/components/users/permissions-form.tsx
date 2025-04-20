'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Permission } from "@/types/user";
import { PERMISSION_GROUPS, PERMISSION_DISPLAY_NAMES } from "@/constants/permissions";
import { getUserPermissionCodes } from "@/lib/permissions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ReloadIcon } from "@radix-ui/react-icons";

interface PermissionsFormProps {
    userId: string;
}

export function PermissionsForm({ userId }: PermissionsFormProps) {
    const [ isLoading, setIsLoading ] = useState(true);
    const [ isSaving, setIsSaving ] = useState(false);
    const [ user, setUser ] = useState<User | null>(null);
    const [ allPermissions, setAllPermissions ] = useState<Permission[]>([]);
    const [ defaultPermissions, setDefaultPermissions ] = useState<string[]>([]);
    const [ selectedPermissions, setSelectedPermissions ] = useState<string[]>([]);

    // Fetch user and permissions data
    useEffect(() => {
        const fetchUserPermissions = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/users/${userId}/permissions`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user permissions');
                }

                const data = await response.json();
                setUser(data.user);
                setAllPermissions(data.allPermissions);
                setDefaultPermissions(data.defaultPermissions);

                // Set selected permissions based on user's existing permissions and role-based defaults
                const userPermissionCodes = getUserPermissionCodes(data.user);
                setSelectedPermissions(userPermissionCodes);
            } catch (error) {
                console.error('Error fetching user permissions:', error);
                toast.error('Failed to load user permissions');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserPermissions();
    }, [ userId ]);

    const handlePermissionChange = (permissionCode: string, checked: boolean) => {
        if (checked) {
            setSelectedPermissions(prev => [ ...prev, permissionCode ]);
        } else {
            setSelectedPermissions(prev => prev.filter(p => p !== permissionCode));
        }
    };

    const handleSavePermissions = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/users/${userId}/permissions`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    permissions: selectedPermissions,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update permissions');
            }

            const data = await response.json();
            setUser(data.user);
            toast.success('Permissions updated successfully');
        } catch (error) {
            console.error('Error updating permissions:', error);
            toast.error('Failed to update permissions');
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetToDefaults = () => {
        setSelectedPermissions(defaultPermissions);
        toast.info('Reset to role defaults. Click Save to apply changes.');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <ReloadIcon className="animate-spin h-6 w-6 mr-2" />
                <p>Loading permissions...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">User not found or error loading user data.</p>
            </div>
        );
    }

    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User';

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Permissions for {userName}</span>
                    <Badge className="ml-2">Role: {user.role}</Badge>
                </CardTitle>
                <CardDescription>
                    Manage the permissions for this user. User has default permissions based on their role, but you can customize them here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full">
                    {PERMISSION_GROUPS.map((group) => (
                        <AccordionItem value={group.name} key={group.name}>
                            <AccordionTrigger className="text-base font-medium">{group.name}</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-2 mt-2">
                                    {group.permissions.map((permCode) => {
                                        const permDetails = allPermissions.find(p => p.code === permCode);
                                        const isDefault = defaultPermissions.includes(permCode);

                                        return (
                                            <div key={permCode} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={permCode}
                                                    checked={selectedPermissions.includes(permCode)}
                                                    onCheckedChange={(checked) => handlePermissionChange(permCode, checked === true)}
                                                />
                                                <label htmlFor={permCode} className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                    {PERMISSION_DISPLAY_NAMES[ permCode ] || permDetails?.name || permCode}
                                                    {isDefault && <Badge variant="outline" className="ml-2 text-xs">Default</Badge>}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleResetToDefaults}>
                    Reset to Role Defaults
                </Button>
                <Button onClick={handleSavePermissions} disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <ReloadIcon className="animate-spin h-4 w-4 mr-2" />
                            Saving...
                        </>
                    ) : 'Save Permissions'}
                </Button>
            </CardFooter>
        </Card>
    );
} 