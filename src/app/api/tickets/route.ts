import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// Schema validation for ticket creation
const ticketCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  assetId: z.string().optional(),
  roomId: z.string().optional()
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

    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, id: true }
    });

    console.log('Database user check:', {
      userId,
      dbUserId: dbUser?.id,
      role: dbUser?.role
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database - Please contact support' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const createdByMe = searchParams.get('createdByMe') === 'true';
    const assignedToMe = searchParams.get('assignedToMe') === 'true';

    // Build the where clause for the query
    const where: any = {};

    // Filter by status if provided
    if (status) {
      where.status = status;
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

    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const validatedData = ticketCreateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.format() },
        { status: 400 }
      );
    }

    const { title, description, priority, assetId, roomId } =
      validatedData.data;

    const newTicket = await db.ticket.create({
      data: {
        title,
        description,
        priority,
        status: 'OPEN',
        createdById: dbUser.id,
        assetId,
        roomId
      },
      include: {
        asset: true,
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
