import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for bulk delete
const bulkDeleteSchema = z.object({
    userIds: z.array(z.string()).min(1)
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Check if prisma client is available
        if (!prisma || !prisma.user) {
            throw new Error("Prisma client is not properly initialized");
        }

        // Validate input
        const result = bulkDeleteSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.format() },
                { status: 400 }
            );
        }

        const { userIds } = result.data;

        // Delete users in a transaction
        const deleteCount = await prisma.$transaction(async (tx) => {
            // First check if all users exist to avoid partial deletion
            const foundUsers = await tx.user.findMany({
                where: {
                    id: { in: userIds }
                },
                select: { id: true }
            });

            const foundIds = foundUsers.map(user => user.id);

            // Check if any users were not found
            const notFoundIds = userIds.filter(id => !foundIds.includes(id));
            if (notFoundIds.length > 0) {
                throw new Error(`Users with ids ${notFoundIds.join(', ')} not found`);
            }

            // Delete all users
            const result = await tx.user.deleteMany({
                where: {
                    id: { in: userIds }
                }
            });

            return result.count;
        });

        return NextResponse.json({
            message: `${deleteCount} users deleted successfully`
        });
    } catch (error) {
        console.error('Error in bulk delete:', error);

        // Handle specific errors
        if (error instanceof Error && error.message.includes('not found')) {
            return NextResponse.json(
                { error: error.message },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to delete users', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
} 