import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

// Schema validation for comment creation
const commentCreateSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
  isPrivate: z.boolean().optional()
});

// Get comments for a ticket
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

    // Check if ticket exists and user has access
    const ticket = await db.ticket.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        createdById: true,
        assignedToId: true,
        moderatorId: true
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check access permissions
    if (
      dbUser.role !== 'admin' &&
      dbUser.role !== 'moderator' &&
      ticket.createdById !== dbUser.id &&
      ticket.assignedToId !== dbUser.id
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch comments with filtering based on user role
    const comments = await db.ticketComment.findMany({
      where: {
        ticketId: params.id,
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
                  // Admins and moderators can see all private comments
                  { AND: [{ ticket: { id: params.id } }] }
                ]
              }
            ]
          }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// Add a comment to a ticket
export async function POST(
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

    // Check if ticket exists
    const ticket = await db.ticket.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        createdById: true,
        assignedToId: true,
        moderatorId: true
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Verify user can comment on this ticket
    if (
      dbUser.role !== 'admin' &&
      dbUser.role !== 'moderator' &&
      ticket.createdById !== dbUser.id &&
      ticket.assignedToId !== dbUser.id
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = commentCreateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.format() },
        { status: 400 }
      );
    }

    const { content, isPrivate = false } = validatedData.data;

    // Only moderators, admins and technicians can create private comments
    if (
      isPrivate &&
      !['admin', 'moderator', 'technician'].includes(dbUser.role)
    ) {
      return NextResponse.json(
        { error: 'Regular users cannot create private comments' },
        { status: 403 }
      );
    }

    const comment = await db.ticketComment.create({
      data: {
        content,
        ticketId: params.id,
        authorId: dbUser.id,
        isPrivate
      }
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
