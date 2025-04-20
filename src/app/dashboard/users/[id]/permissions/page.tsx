'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { PermissionsForm } from '@/components/users/permissions-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from 'next/link';
import { ShieldCheck } from "lucide-react";

interface UserPermissionsPageProps {
    params: Promise<{ id: string }>;
}

export default function UserPermissionsPage({ params }: UserPermissionsPageProps) {
    // Unwrap the params Promise using React.use()
    const resolvedParams = React.use(params);
    const { id } = resolvedParams;

    const [ userName, setUserName ] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`/api/users/${id}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const userData = await response.json();
                const name = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username || 'User';
                setUserName(name);
            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error('Failed to load user data');
            }
        };

        fetchUserData();
    }, [ id ]);

    const handleSeedPermissions = async () => {
        try {
            const response = await fetch('/api/seed-permissions', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to seed permissions');
            }

            const data = await response.json();
            if (data.success) {
                toast.success(`${data.message}. Reload the page to see updated permissions.`);
            } else {
                toast.error('Failed to seed permissions');
            }
        } catch (error) {
            console.error('Error seeding permissions:', error);
            toast.error('Failed to seed permissions');
        }
    };

    return (
        <div className="flex flex-col space-y-6 p-6 h-[calc(100vh-50px)] overflow-y-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold flex items-center">
                    <ShieldCheck className="h-5 w-5 mr-2" />
                    User Permissions
                </h1>

                <div className="flex items-center space-x-2">
                    <Link href={`/dashboard/users/${id}`}>
                        <Button variant="outline" size="sm">
                            View Profile
                        </Button>
                    </Link>
                    <Button onClick={handleSeedPermissions} variant="outline" size="sm">
                        Seed Permissions
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <ShieldCheck className="h-5 w-5 mr-2" />
                            User Permissions for {userName || id}
                        </CardTitle>
                        <CardDescription>
                            Manage what this user can access and actions they can perform in the system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Permissions are based on the user&apos;s role by default. You can customize them by granting or revoking specific permissions.
                            Role-based default permissions are marked as &quot;Default&quot;.
                        </p>
                    </CardContent>
                </Card>

                <PermissionsForm userId={id} />
            </div>
        </div>
    );
} 