import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;

    const floor = await prisma.floor.findUnique({
      where: { id },
      include: {
        building: true,
        rooms: {
          orderBy: {
            number: 'asc'
          }
        }
      }
    });

    if (!floor) {
      return NextResponse.json({ error: 'Floor not found' }, { status: 404 });
    }

    return NextResponse.json(floor);
  } catch (error) {
    console.error('Error fetching floor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch floor details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const data = await req.json();
    const { number, name, buildingId } = data;

    // Check if floor exists
    const existingFloor = await prisma.floor.findUnique({
      where: { id }
    });

    if (!existingFloor) {
      return NextResponse.json({ error: 'Floor not found' }, { status: 404 });
    }

    // Check if the updated floor number already exists in the building
    if (number !== undefined && buildingId) {
      const duplicateFloor = await prisma.floor.findFirst({
        where: {
          number: Number(number),
          buildingId,
          id: { not: id }
        }
      });

      if (duplicateFloor) {
        return NextResponse.json(
          { error: 'A floor with this number already exists in this building' },
          { status: 409 }
        );
      }
    }

    const updatedFloor = await prisma.floor.update({
      where: { id },
      data: {
        ...(number !== undefined && { number: Number(number) }),
        ...(name !== undefined && { name }),
        ...(buildingId && { buildingId })
      },
      include: {
        building: true
      }
    });

    return NextResponse.json(updatedFloor);
  } catch (error) {
    console.error('Error updating floor:', error);
    return NextResponse.json(
      { error: 'Failed to update floor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;

    // Check if floor exists
    const floor = await prisma.floor.findUnique({
      where: { id },
      include: {
        rooms: true
      }
    });

    if (!floor) {
      return NextResponse.json({ error: 'Floor not found' }, { status: 404 });
    }

    // Check if floor has rooms
    if (floor.rooms.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete floor with rooms. Delete all rooms first.' },
        { status: 400 }
      );
    }

    // Delete the floor
    await prisma.floor.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting floor:', error);
    return NextResponse.json(
      { error: 'Failed to delete floor' },
      { status: 500 }
    );
  }
}
