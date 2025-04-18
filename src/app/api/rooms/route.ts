import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all rooms or rooms by floor ID or building ID
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const floorId = searchParams.get('floorId');
        const buildingId = searchParams.get('buildingId');

        let whereClause = {};

        if (floorId) {
            whereClause = { floorId };
        } else if (buildingId) {
            // Get all rooms in a building across all floors
            const floors = await prisma.floor.findMany({
                where: { buildingId },
                select: { id: true }
            });

            const floorIds = floors.map(floor => floor.id);
            whereClause = { floorId: { in: floorIds } };
        }

        const rooms = await prisma.room.findMany({
            where: whereClause,
            include: {
                floor: {
                    include: {
                        building: true
                    }
                },
                assets: true
            }
        });

        return NextResponse.json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return NextResponse.json(
            { error: 'Failed to fetch rooms' },
            { status: 500 }
        );
    }
}

// POST to create a new room
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { number, name, type, floorId } = data;

        if (!floorId || !number) {
            return NextResponse.json(
                { error: 'Floor ID and room number are required' },
                { status: 400 }
            );
        }

        // Verify the floor exists
        const floor = await prisma.floor.findUnique({
            where: { id: floorId }
        });

        if (!floor) {
            return NextResponse.json(
                { error: 'Floor not found' },
                { status: 404 }
            );
        }

        const room = await prisma.room.create({
            data: {
                number,
                name,
                type: type || 'CLASSROOM',
                floorId
            }
        });

        return NextResponse.json(room, { status: 201 });
    } catch (error) {
        console.error('Error creating room:', error);
        return NextResponse.json(
            { error: 'Failed to create room' },
            { status: 500 }
        );
    }
} 