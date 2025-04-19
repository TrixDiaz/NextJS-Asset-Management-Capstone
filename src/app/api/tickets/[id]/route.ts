import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

// Schema validation for ticket updates
const ticketUpdateSchema = z.object({
    status: z.enum([ 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED' ]).optional(),
    priority: z.enum([ 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL' ]).optional(),
    assignedToId: z.string().optional().nullable(),
    moderatorId: z.string().optional().nullable(),
});

// Get a specific ticket
export async function GET(
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
            select: { role: true, id: true },
        });

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const ticket = await db.ticket.findUnique({
            where: { id: params.id },
            include: {
                asset: true,
                room: {
                    include: {
                        floor: {
                            include: {
                                building: true,
                            },
                        },
                    },
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
                                            { ticket: { assignedToId: dbUser.id } },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
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
        return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
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
            select: { role: true, id: true },
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
            },
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        const body = await req.json();
        const validatedData = ticketUpdateSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ error: validatedData.error.format() }, { status: 400 });
        }

        const { status, priority, assignedToId, moderatorId } = validatedData.data;

        // Role-based permissions for ticket updates
        if (dbUser.role === 'member' && ticket.createdById !== dbUser.id) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Members can only resolve tickets they created
        if (status === 'RESOLVED' && dbUser.role === 'member' && ticket.createdById !== dbUser.id) {
            return NextResponse.json(
                { error: 'Only ticket creators can resolve their tickets' },
                { status: 403 }
            );
        }

        // Technicians can only update status of tickets assigned to them
        if (
            dbUser.role === 'technician' &&
            status &&
            ticket.assignedToId !== dbUser.id
        ) {
            return NextResponse.json(
                { error: 'Technicians can only update tickets assigned to them' },
                { status: 403 }
            );
        }

        // Build update data
        const updateData: any = {};

        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;

        // Only techs/admins/moderators can assign tickets
        if (assignedToId !== undefined && [ 'technician', 'admin', 'moderator' ].includes(dbUser.role)) {
            updateData.assignedToId = assignedToId;
        }

        // Only admins/moderators can set moderators
        if (moderatorId !== undefined && [ 'admin', 'moderator' ].includes(dbUser.role)) {
            updateData.moderatorId = moderatorId;
        }

        // Add resolvedAt timestamp if resolving the ticket
        if (status === 'RESOLVED' && ticket.status !== 'RESOLVED') {
            updateData.resolvedAt = new Date();
        }

        const updatedTicket = await db.ticket.update({
            where: { id: params.id },
            data: updateData,
        });

        return NextResponse.json(updatedTicket);
    } catch (error) {
        console.error('Error updating ticket:', error);
        return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }
} 