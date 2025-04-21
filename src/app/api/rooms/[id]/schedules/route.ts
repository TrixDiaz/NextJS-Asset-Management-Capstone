import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all schedules for a room
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    // Check if room exists
    const roomExists = await prisma.room.findUnique({
      where: { id }
    });

    if (!roomExists) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Get room's schedules with user information
    const schedules = await prisma.schedule.findMany({
      where: { roomId: id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        }
      },
      orderBy: [ { dayOfWeek: 'asc' }, { startTime: 'asc' } ]
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules for room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}
