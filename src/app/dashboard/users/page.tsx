import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { DataTable } from '@/components/users/data-table';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';

// Map permissions to readable name for the table
const formatUserData = (users: any[]) => {
    return users.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        permissions: user.permissions?.map((p: any) => p.permission.name) || [],
    }));
};

export default async function UsersPage() {
    try {
        // Check if prisma client is initialized
        if (!prisma || !prisma.user) {
            throw new Error("Prisma client is not properly initialized");
        }

        // Fetch users with their permissions
        const users = await prisma.user.findMany({
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Format data for the table
        const tableData = formatUserData(users);

        return (
            <div className="p-6 space-y-6 w-full">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <Link href="/dashboard/users/new">
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </Link>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <Suspense fallback={<div className="p-8 text-center">Loading users...</div>}>
                        <DataTable data={tableData} />
                    </Suspense>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error loading users:", error);
        throw error; // Let the error boundary handle it
    }
} 