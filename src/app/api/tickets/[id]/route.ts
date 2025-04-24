import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

// Schema validation for ticket updates
const ticketUpdateSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  ticketType: z
    .enum(['ISSUE_REPORT', 'ROOM_REQUEST', 'ASSET_REQUEST'])
    .optional(),
  assignedToId: z.string().optional().nullable(),
  moderatorId: z.string().optional().nullable(),
  roomId: z.string().optional().nullable(),
  assetId: z.string().optional().nullable(),
  requestedAssetId: z.string().optional().nullable(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  dayOfWeek: z.string().optional().nullable()
});

// Get a specific ticket
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const ticket = await db.ticket.findUnique({
      where: { id: params.id },
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
        attachments: true,
        comments: {
          orderBy: { createdAt: 'desc' },
          // Filter comments based on user role and privacy setting
          where: {
            OR: [
              { isPrivate: false },
              { authorId: dbUser.id },
              {
                isPrivate: true,
                AND: [
                  {
                    OR: [
                      { ticket: { moderatorId: dbUser.id } },
                      { ticket: { assignedToId: dbUser.id } }
                    ]
                  }
                ]
              }
            ]
          }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check if user has access to this ticket
    if (
      dbUser.role !== 'admin' &&
      dbUser.role !== 'moderator' &&
      ticket.createdById !== dbUser.id &&
      ticket.assignedToId !== dbUser.id
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

// Update a ticket
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const ticket = await db.ticket.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        status: true,
        createdById: true,
        assignedToId: true,
        moderatorId: true,
        ticketType: true,
        roomId: true,
        assetId: true,
        requestedAssetId: true,
        startTime: true,
        endTime: true,
        dayOfWeek: true
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check permissions - only admin, moderator, assigned tech, or creator can update
    const canUpdate =
      dbUser.role === 'admin' ||
      dbUser.role === 'moderator' ||
      ticket.assignedToId === dbUser.id ||
      ticket.createdById === dbUser.id;

    if (!canUpdate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = ticketUpdateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.format() },
        { status: 400 }
      );
    }

    const updateData = { ...validatedData.data };

    // Handle date conversions if provided
    if (updateData.startTime) {
      updateData.startTime = new Date(updateData.startTime);
    }

    if (updateData.endTime) {
      updateData.endTime = new Date(updateData.endTime);
    }

    // Check for room availability if this is a room request and dates/room are being updated
    if (
      ticket.ticketType === 'ROOM_REQUEST' &&
      (updateData.roomId ||
        updateData.startTime ||
        updateData.endTime ||
        updateData.dayOfWeek)
    ) {
      const roomId = updateData.roomId || ticket.roomId;
      const dayOfWeek = updateData.dayOfWeek || ticket.dayOfWeek;
      const startTime = updateData.startTime || ticket.startTime;
      const endTime = updateData.endTime || ticket.endTime;

      if (roomId && dayOfWeek && startTime && endTime) {
        const conflictingSchedule = await db.schedule.findFirst({
          where: {
            roomId,
            dayOfWeek,
            OR: [
              {
                startTime: {
                  lte: endTime
                },
                endTime: {
                  gte: startTime
                }
              }
            ],
            // Exclude current ticket's schedule if any
            NOT: {
              id: ticket.id
            }
          }
        });

        if (conflictingSchedule) {
          return NextResponse.json(
            { error: 'Room is already booked for the requested time' },
            { status: 409 }
          );
        }
      }
    }

    // Set resolvedAt if status is changing to RESOLVED
    if (updateData.status === 'RESOLVED' && ticket.status !== 'RESOLVED') {
      updateData.resolvedAt = new Date();
    }

    // Remove resolvedAt if reopening the ticket
    if (
      (updateData.status === 'OPEN' || updateData.status === 'IN_PROGRESS') &&
      (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED')
    ) {
      updateData.resolvedAt = null;
    }

    const updatedTicket = await db.ticket.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}
