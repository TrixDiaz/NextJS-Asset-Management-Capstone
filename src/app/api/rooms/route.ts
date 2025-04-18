import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all rooms
export async function GET(req: NextRequest) {
    try {
        // Get search params for filtering
        const { searchParams } = new URL(req.url);
        const buildingId = searchParams.get('buildingId');
        const floorId = searchParams.get('floorId');
        const roomType = searchParams.get('type');

        // Build where clause based on filters
        let whereClause: any = {};

        if (buildingId) {
            whereClause.floor = {
                buildingId
            };
        }

        if (floorId) {
            whereClause.floorId = floorId;
        }

        if (roomType) {
            whereClause.type = roomType;
        }

        // Use raw query for more complex joins
        let rooms;
        try {
            rooms = await prisma.$queryRaw`
                SELECT 
                    r.id, 
                    r.number, 
                    r.name, 
                    r."type", 
                    r."floorId",
                    f.number as "floorNumber",
                    f."buildingId",
                    b.name as "buildingName"
                FROM "Room" r
                JOIN "Floor" f ON r."floorId" = f.id
                JOIN "Building" b ON f."buildingId" = b.id
                ORDER BY b.name, f.number, r.number
            `;

            // Format the response to match the expected structure
            const formattedRooms = (rooms as any[]).map(room => ({
                id: room.id,
                number: room.number,
                name: room.name,
                type: room.type,
                floor: {
                    id: room.floorId,
                    number: room.floorNumber,
                    building: {
                        id: room.buildingId,
                        name: room.buildingName
                    }
                }
            }));

            return NextResponse.json(formattedRooms);
        } catch (queryError) {
            console.error('Error in rooms query:', queryError);

            // Fallback to simpler query if the complex one fails
            console.log('Trying simpler query...');

            const fallbackRooms = await prisma.room.findMany({
                where: whereClause,
                select: {
                    id: true,
                    number: true,
                    name: true,
                    type: true,
                    floor: {
                        select: {
                            id: true,
                            number: true,
                            building: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: [
                    { floor: { building: { name: 'asc' } } },
                    { floor: { number: 'asc' } },
                    { number: 'asc' }
                ]
            });

            return NextResponse.json(fallbackRooms);
        }
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return NextResponse.json(
            { error: 'Failed to fetch rooms', details: String(error) },
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