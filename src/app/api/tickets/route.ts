import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// Schema validation for ticket creation
const ticketCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  ticketType: z
    .enum(['ISSUE_REPORT', 'ROOM_REQUEST', 'ASSET_REQUEST'])
    .default('ISSUE_REPORT'),
  assetId: z.string().optional(),
  roomId: z.string().optional(),
  requestedAssetId: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  dayOfWeek: z.string().optional()
});

// Get all tickets with filtering based on user role
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    // Log authentication details for debugging
    console.log('Auth check result:', { userId, isAuthenticated: !!userId });

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Find or create user in database
    let dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, id: true }
    });

    console.log('Database user check:', {
      userId,
      dbUserId: dbUser?.id,
      role: dbUser?.role
    });

    // If user doesn't exist in database, create a basic record
    if (!dbUser) {
      try {
        // Create a minimal user record
        dbUser = await db.user.create({
          data: {
            clerkId: userId,
            role: 'member' // Default role
          },
          select: { role: true, id: true }
        });

        console.log('Created new user in database:', dbUser);
      } catch (createError) {
        console.error('Failed to create user in database:', createError);
        return NextResponse.json(
          { error: 'User sync error - Please try again later' },
          { status: 500 }
        );
      }
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const ticketType = searchParams.get('ticketType');
    const createdByMe = searchParams.get('createdByMe') === 'true';
    const assignedToMe = searchParams.get('assignedToMe') === 'true';

    // Build the where clause for the query
    const where: any = {};

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    // Filter by ticket type if provided
    if (ticketType) {
      where.ticketType = ticketType;
    }

    // Filter by user role and requested filter
    if (createdByMe) {
      where.createdById = dbUser.id;
    } else if (assignedToMe) {
      where.assignedToId = dbUser.id;
    } else if (dbUser.role === 'member') {
      // Members can only see tickets they created
      where.createdById = dbUser.id;
    } else if (dbUser.role === 'technician') {
      // Technicians can see tickets assigned to them or unassigned tickets
      where.OR = [{ assignedToId: dbUser.id }, { assignedToId: null }];
    }
    // Admins and moderators can see all tickets, so no additional filters

    // Fetch tickets from the database
    const tickets = await db.ticket.findMany({
      where,
      include: {
        asset: true,
        requestedAsset: true,
        room: {
          include: {
            floor: {
              include: {
                building: true
              }
            }
          }
        },
        attachments: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

// Create a new ticket
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find or create user
    let dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });

    // If user doesn't exist in database, create a basic record
    if (!dbUser) {
      try {
        // Create a minimal user record
        dbUser = await db.user.create({
          data: {
            clerkId: userId,
            role: 'member' // Default role
          },
          select: { id: true }
        });
      } catch (createError) {
        console.error('Failed to create user in database:', createError);
        return NextResponse.json(
          { error: 'User sync error - Please try again later' },
          { status: 500 }
        );
      }
    }

    const body = await req.json();
    const validatedData = ticketCreateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.format() },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      priority,
      ticketType,
      assetId,
      roomId,
      requestedAssetId,
      startTime,
      endTime,
      dayOfWeek
    } = validatedData.data;

    // Validate fields based on ticket type
    if (ticketType === 'ROOM_REQUEST' && (!roomId || !startTime || !endTime)) {
      return NextResponse.json(
        {
          error: 'Room, start time, and end time are required for room requests'
        },
        { status: 400 }
      );
    }

    if (ticketType === 'ASSET_REQUEST' && !requestedAssetId) {
      return NextResponse.json(
        { error: 'Asset ID is required for asset requests' },
        { status: 400 }
      );
    }

    // Check for room availability if room request
    if (
      ticketType === 'ROOM_REQUEST' &&
      roomId &&
      startTime &&
      endTime &&
      dayOfWeek
    ) {
      const conflictingSchedule = await db.schedule.findFirst({
        where: {
          roomId,
          dayOfWeek,
          OR: [
            {
              startTime: {
                lte: new Date(endTime)
              },
              endTime: {
                gte: new Date(startTime)
              }
            }
          ]
        }
      });

      if (conflictingSchedule) {
        return NextResponse.json(
          { error: 'Room is already booked for the requested time' },
          { status: 409 }
        );
      }
    }

    // Create ticket data object
    const ticketData: any = {
      title,
      description,
      priority,
      ticketType,
      status: 'OPEN',
      createdById: dbUser.id,
      assetId,
      roomId
    };

    // Add additional fields based on ticket type
    if (ticketType === 'ROOM_REQUEST') {
      ticketData.startTime = startTime ? new Date(startTime) : undefined;
      ticketData.endTime = endTime ? new Date(endTime) : undefined;
      ticketData.dayOfWeek = dayOfWeek;
    }

    if (ticketType === 'ASSET_REQUEST') {
      ticketData.requestedAssetId = requestedAssetId;
    }

    const newTicket = await db.ticket.create({
      data: ticketData,
      include: {
        asset: true,
        requestedAsset: true,
        room: {
          include: {
            floor: {
              include: {
                building: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(newTicket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
