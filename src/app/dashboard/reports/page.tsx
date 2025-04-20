'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserReports from './user-reports';
import BuildingReports from './building-reports';
import AssetReports from './asset-reports';
import StorageReports from './storage-reports';
import { useUser } from '@clerk/nextjs';
import { User } from '@/types/user';
import { usePermissions } from '@/hooks/use-permissions';
import {
    REPORT_READ,
    REPORT_CREATE,
    REPORT_EXPORT
} from '@/constants/permissions';

// Define permission actions
type Permission = 'create' | 'read' | 'export';

export default function ReportsPage() {
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
            case 'create':
                return can(REPORT_CREATE);
            case 'read':
                return can(REPORT_READ);
            case 'export':
                return can(REPORT_EXPORT);
            default:
                return false;
        }
    };

    return (
        <div className="h-[calc(100vh-5rem)] overflow-auto">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Reports Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        View and analyze data across users, buildings, assets, and storage
                    </p>
                </div>

                <Tabs defaultValue="users" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="buildings">Buildings & Rooms</TabsTrigger>
                        <TabsTrigger value="assets">Assets</TabsTrigger>
                        <TabsTrigger value="storage">Storage</TabsTrigger>
                    </TabsList>

                    <div className="pb-8">
                        <TabsContent value="users">
                            <UserReports />
                        </TabsContent>

                        <TabsContent value="buildings">
                            <BuildingReports />
                        </TabsContent>

                        <TabsContent value="assets">
                            <AssetReports />
                        </TabsContent>

                        <TabsContent value="storage">
                            <StorageReports />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
} 