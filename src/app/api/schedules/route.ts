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
  userId: z.string(),
  roomId: z.string()
});

// GET all schedules
export async function GET(_req: NextRequest) {
  try {
    // Check if prisma client is initialized
    if (!prisma) {
      throw new Error('Database connection not initialized');
    }

    try {
      // Check if schedule table exists by checking db client
      // @ts-ignore - We know this exists even if TypeScript doesn't
      if (!prisma.schedule) {
        console.error('Schedule model not found in Prisma client');
        return NextResponse.json([]);
      }

      // Get schedules with related information
      // @ts-ignore - We know this exists even if TypeScript doesn't
      const schedules = await prisma.schedule.findMany({
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              email: true,
              role: true
            }
          },
          room: {
            include: {
              floor: {
                include: {
                  building: true
                }
              }
            }
          }
        },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
      });

      // Format response to match other API endpoints
      return NextResponse.json({
        success: true,
        data: schedules
      });
    } catch (dbError) {
      console.error('Database error fetching schedules:', dbError);

      // Return empty array instead of error for better client handling
      return NextResponse.json({
        success: false,
        data: []
      });
    }
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch schedules',
        details: String(error)
      },
      { status: 500 }
    );
  }
}

// POST create a new schedule
export async function POST(req: NextRequest) {
  try {
    // Check if prisma client is initialized
    if (!prisma) {
      throw new Error('Database connection not initialized');
    }

    // Check if schedule table exists
    // @ts-ignore - We know this exists even if TypeScript doesn't
    if (!prisma.schedule) {
      throw new Error('Schedule model not found in Prisma client');
    }

    const body = await req.json();
    console.log('Received schedule create request:', body);

    // Validate input
    const result = scheduleCreateSchema.safeParse(body);
    if (!result.success) {
      console.error('Validation failed:', result.error.format());
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const { data } = result;

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!userExists) {
      console.error('User not found:', data.userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if room exists
    const roomExists = await prisma.room.findUnique({
      where: { id: data.roomId }
    });

    if (!roomExists) {
      console.error('Room not found:', data.roomId);
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Log dates for debugging
    console.log(
      'Start time:',
      data.startTime,
      '- parsed as:',
      new Date(data.startTime)
    );
    console.log(
      'End time:',
      data.endTime,
      '- parsed as:',
      new Date(data.endTime)
    );

    // Create schedule
    // @ts-ignore - We know this exists even if TypeScript doesn't
    const schedule = await prisma.schedule.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        dayOfWeek: data.dayOfWeek,
        userId: data.userId,
        roomId: data.roomId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true
          }
        },
        room: true
      }
    });

    console.log('Schedule created successfully:', schedule.id);
    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      {
        error: 'Failed to create schedule',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
