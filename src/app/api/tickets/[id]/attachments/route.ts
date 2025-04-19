import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

// Handle file uploads for a ticket
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
            select: { role: true, id: true },
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
                moderatorId: true,
            },
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        // Check if user has access to the ticket
        if (
            dbUser.role !== 'admin' &&
            dbUser.role !== 'moderator' &&
            ticket.createdById !== dbUser.id &&
            ticket.assignedToId !== dbUser.id
        ) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // In a real implementation, here you would:
        // 1. Process the uploaded file (save to storage service like S3)
        // 2. Create an attachment record in the database

        // For demonstration, we're simulating a file upload with provided metadata
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Simulated file upload - in a real app, upload to storage service
        // and get a URL back, then store that URL in the database
        const fileUrl = `https://example.com/uploads/${file.name}`;

        // Create attachment record
        const attachment = await db.attachment.create({
            data: {
                fileName: file.name,
                fileUrl,
                fileType: file.type,
                fileSize: file.size,
                ticketId: params.id,
            },
        });

        return NextResponse.json(attachment);
    } catch (error) {
        console.error('Error uploading attachment:', error);
        return NextResponse.json({ error: 'Failed to upload attachment' }, { status: 500 });
    }
}

// Get all attachments for a ticket
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

        // Check if ticket exists
        const ticket = await db.ticket.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                createdById: true,
                assignedToId: true,
                moderatorId: true,
            },
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        // Check if user has access to the ticket
        if (
            dbUser.role !== 'admin' &&
            dbUser.role !== 'moderator' &&
            ticket.createdById !== dbUser.id &&
            ticket.assignedToId !== dbUser.id
        ) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Get attachments
        const attachments = await db.attachment.findMany({
            where: { ticketId: params.id },
            orderBy: { uploadedAt: 'desc' },
        });

        return NextResponse.json(attachments);
    } catch (error) {
        console.error('Error fetching attachments:', error);
        return NextResponse.json({ error: 'Failed to fetch attachments' }, { status: 500 });
    }
} 