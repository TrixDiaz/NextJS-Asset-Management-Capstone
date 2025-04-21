import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for schedule creation
const scheduleCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Start time must be a valid date string'
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'End time must be a valid date string'
  }),
  dayOfWeek: z.enum([
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
  ]),
  roomId: z.string()
});

// GET all schedules for a user
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id }
    });

    if (!userExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's schedules with room information
    const schedules = await prisma.schedule.findMany({
      where: { userId: id },
      include: { room: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

// POST create a new schedule for a user
export async function POST(
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate input
    const result = scheduleCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const { data } = result;

    // Check if room exists
    const roomExists = await prisma.room.findUnique({
      where: { id: data.roomId }
    });

    if (!roomExists) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check for schedule conflicts
    const conflictingSchedule = await prisma.schedule.findFirst({
      where: {
        roomId: data.roomId,
        dayOfWeek: data.dayOfWeek,
        OR: [
          {
            startTime: {
              lte: new Date(data.endTime)
            },
            endTime: {
              gte: new Date(data.startTime)
            }
          }
        ]
      }
    });

    if (conflictingSchedule) {
      return NextResponse.json(
        { error: 'Schedule conflicts with an existing booking' },
        { status: 409 }
      );
    }

    // Create schedule
    const schedule = await prisma.schedule.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        dayOfWeek: data.dayOfWeek,
        userId: id,
        roomId: data.roomId
      },
      include: { room: true }
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
}
