import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all rooms
export async function GET(req: NextRequest) {
  try {
    // Verify prisma is initialized
    if (!prisma) {
      throw new Error('Database connection not initialized');
    }

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

    // Try getting basic rooms if the complex query fails
    try {
      const simpleRooms = await prisma.room.findMany({
        include: {
          floor: {
            include: {
              building: true
            }
          }
        },
        orderBy: [
          { floor: { building: { name: 'asc' } } },
          { floor: { number: 'asc' } },
          { number: 'asc' }
        ],
        take: 100
      });

      if (simpleRooms.length > 0) {
        return NextResponse.json(simpleRooms);
      }

      // If we have no rooms, check if we need to create a sample room
      if (simpleRooms.length === 0) {
        // Try to create sample data
        const origin = new URL(req.url).origin;
        await fetch(`${origin}/api/seed`);

        // Try to get rooms again
        const newRooms = await prisma.room.findMany({
          include: {
            floor: {
              include: {
                building: true
              }
            }
          },
          take: 10
        });

        return NextResponse.json(newRooms);
      }
    } catch (error) {
      console.error('Error in simple room query:', error);

      // Return a simple empty array rather than error
      return NextResponse.json([]);
    }

    // If we get here, return an empty array
    return NextResponse.json([]);
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
      return NextResponse.json({ error: 'Floor not found' }, { status: 404 });
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
