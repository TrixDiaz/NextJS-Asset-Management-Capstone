import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for user update
const userUpdateSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    username: z.string().min(3).optional(),
    email: z.string().email().optional(),
    role: z.enum([ 'admin', 'manager', 'user', 'guest' ]).optional(),
    profileImageUrl: z.string().url().optional().nullable(),
});

// GET user by id
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check if prisma client is available
        if (!prisma || !prisma.user) {
            throw new Error("Prisma client is not properly initialized");
        }

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

        return NextResponse.json(user);
    } catch (error) {
        console.error(`Error fetching user ${params.id}:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch user', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// PUT update user
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();

        // Check if prisma client is available
        if (!prisma || !prisma.user) {
            throw new Error("Prisma client is not properly initialized");
        }

        // Validate input
        const result = userUpdateSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.format() },
                { status: 400 }
            );
        }

        const { data } = result;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id }
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id },
            data,
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error(`Error updating user ${params.id}:`, error);

        // Handle duplicate key errors
        if (error instanceof Error && error.message.includes('Unique constraint failed')) {
            return NextResponse.json(
                { error: 'Username or email already in use' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update user', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// DELETE user
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check if prisma client is available
        if (!prisma || !prisma.user) {
            throw new Error("Prisma client is not properly initialized");
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id }
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Delete user
        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json(
            { message: 'User deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error(`Error deleting user ${params.id}:`, error);
        return NextResponse.json(
            { error: 'Failed to delete user', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
} 