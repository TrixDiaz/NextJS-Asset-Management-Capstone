import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

// Schema validation for ticket creation
const ticketCreateSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    priority: z.enum([ 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL' ]),
    assetId: z.string().optional(),
    roomId: z.string().optional(),
});

// Mock tickets data for development
const mockTickets = [
    {
        id: '1',
        title: 'Computer not working in Room 302',
        description: 'The desktop computer in Room 302 won\'t turn on. It was working yesterday.',
        status: 'OPEN',
        priority: 'HIGH',
        createdAt: new Date().toISOString(),
        asset: {
            id: 'a1',
            assetTag: 'PC-302-01',
            assetType: 'COMPUTER'
        },
        room: {
            id: 'r1',
            number: '302',
            name: 'Computer Lab',
            floor: {
                number: 3,
                building: {
                    name: 'Main Building'
                }
            }
        },
        attachments: []
    },
    {
        id: '2',
        title: 'Projector display has color issues',
        description: 'The projector in Room 201 is showing everything with a green tint.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        asset: {
            id: 'a2',
            assetTag: 'PRJ-201-01',
            assetType: 'PROJECTOR'
        },
        room: {
            id: 'r2',
            number: '201',
            name: 'Lecture Hall',
            floor: {
                number: 2,
                building: {
                    name: 'Main Building'
                }
            }
        },
        attachments: []
    },
    {
        id: '3',
        title: 'Network connection down in office area',
        description: 'The entire office area on the first floor has lost network connectivity.',
        status: 'RESOLVED',
        priority: 'CRITICAL',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        asset: {
            id: 'a3',
            assetTag: 'NW-101-01',
            assetType: 'NETWORK_EQUIPMENT'
        },
        room: {
            id: 'r3',
            number: '101',
            name: 'Admin Office',
            floor: {
                number: 1,
                building: {
                    name: 'Main Building'
                }
            }
        },
        attachments: []
    }
];

// Get all tickets with filtering based on user role
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const createdByMe = searchParams.get('createdByMe') === 'true';
        const assignedToMe = searchParams.get('assignedToMe') === 'true';

        // Filter mock data based on query parameters
        let filteredTickets = [ ...mockTickets ];

        if (status) {
            filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
        }

        // In a real app, we would use the user's role and filter accordingly
        // For the mock, we'll just return all tickets

        return NextResponse.json(filteredTickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }
}

// Create a new ticket
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = ticketCreateSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ error: validatedData.error.format() }, { status: 400 });
        }

        const { title, description, priority, assetId, roomId } = validatedData.data;

        // In a real app, we would save to the database
        // For the mock, we'll just return a success message
        const newTicket = {
            id: `${mockTickets.length + 1}`,
            title,
            description,
            status: 'OPEN',
            priority,
            createdAt: new Date().toISOString(),
            asset: null,
            room: null,
            attachments: []
        };

        return NextResponse.json(newTicket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }
} 