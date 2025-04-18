import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for bulk role update
const bulkUpdateSchema = z.object({
    userIds: z.array(z.string()),
    role: z.enum([ 'admin', 'manager', 'user', 'guest' ])
});

export async function POST(req: NextRequest) {
    try {
        // Check if prisma client is initialized
        if (!prisma || !prisma.user) {
            throw new Error("Prisma client is not properly initialized");
        }

        const body = await req.json();

        // Validate input
        const result = bulkUpdateSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.format() },
                { status: 400 }
            );
        }

        const { userIds, role } = result.data;

        // Safety check - don't allow empty array 
        if (userIds.length === 0) {
            return NextResponse.json(
                { error: 'No user IDs provided' },
                { status: 400 }
            );
        }

        // Update the users
        const updateResult = await prisma.user.updateMany({
            where: {
                id: {
                    in: userIds
                }
            },
            data: {
                role
            }
        });

        return NextResponse.json({
            message: `${updateResult.count} users updated successfully to ${role} role`
        });
    } catch (error) {
        console.error('Error updating users:', error);
        return NextResponse.json(
            { error: 'Failed to update users', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
} 