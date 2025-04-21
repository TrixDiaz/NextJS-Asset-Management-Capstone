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

// GET a single user by ID
export async function GET(
    request: NextRequest,
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
                },
                schedules: true
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
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}

// PATCH update a user
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();

        // Check if user exists
        const userExists = await prisma.user.findUnique({
            where: { id }
        });

        if (!userExists) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
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

        // Check uniqueness of username if it's being updated
        if (data.username && data.username !== userExists.username) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    username: data.username,
                    id: { not: id }
                }
            });

            if (existingUser) {
                return NextResponse.json(
                    { error: 'Username already taken' },
                    { status: 409 }
                );
            }
        }

        // Check uniqueness of email if it's being updated
        if (data.email && data.email !== userExists.email) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    email: data.email,
                    id: { not: id }
                }
            });

            if (existingUser) {
                return NextResponse.json(
                    { error: 'Email already taken' },
                    { status: 409 }
                );
            }
        }

        // Update the user
        const updatedUser = await prisma.user.update({
            where: { id },
            data
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

// DELETE a user
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check if user exists
        const userExists = await prisma.user.findUnique({
            where: { id }
        });

        if (!userExists) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Delete the user
        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
} 