import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for bulk delete
const bulkDeleteSchema = z.object({
  userIds: z.array(z.string())
});

export async function POST(req: NextRequest) {
  try {
    // Check if prisma client is initialized
    if (!prisma || !prisma.user) {
      throw new Error('Prisma client is not properly initialized');
    }

    const body = await req.json();

    // Validate input
    const result = bulkDeleteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const { userIds } = result.data;

    // Safety check - don't allow empty array
    if (userIds.length === 0) {
      return NextResponse.json(
        { error: 'No user IDs provided' },
        { status: 400 }
      );
    }

    // Delete the users
    const deleteResult = await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds
        }
      }
    });

    return NextResponse.json({
      message: `${deleteResult.count} users deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting users:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete users',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
