import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getDefaultPermissionsForRole } from '@/lib/permissions';
import { Role } from '@/types/user';

// Schema for user permission update
const permissionUpdateSchema = z.object({
    permissions: z.array(z.string())
});

// GET user permissions
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get all available permissions for reference
        const allPermissions = await prisma.permission.findMany();

        // Get the default permissions for this user's role
        const defaultPermissions = getDefaultPermissionsForRole(user.role as Role);

        return NextResponse.json({
            user,
            allPermissions,
            defaultPermissions
        });
    } catch (error) {
        console.error('Error fetching user permissions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user permissions' },
            { status: 500 }
        );
    }
}

// PUT update user permissions
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();

        // Validate input
        const result = permissionUpdateSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.format() },
                { status: 400 }
            );
        }

        const { permissions } = result.data;

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                permissions: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get the permission entities from the database
        const permissionEntities = await prisma.permission.findMany({
            where: {
                code: {
                    in: permissions
                }
            }
        });

        // Delete all existing permissions for this user
        await prisma.userPermission.deleteMany({
            where: {
                userId: id
            }
        });

        // Create an array of all permissions to add
        const permissionsToAdd = permissionEntities.map(p => ({
            userId: id,
            permissionId: p.id
        }));

        // Add the new permissions
        if (permissionsToAdd.length > 0) {
            await prisma.userPermission.createMany({
                data: permissionsToAdd
            });
        }

        // Get the updated user with permissions
        const updatedUser = await prisma.user.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user permissions:', error);
        return NextResponse.json(
            { error: 'Failed to update user permissions', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
} 