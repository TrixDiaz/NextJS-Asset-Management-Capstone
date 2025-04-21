import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a single room by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        floor: {
          include: {
            building: true
          }
        }
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Generate QR code data URL
    const roomData = {
      id: room.id,
      name: room.name,
      number: room.number,
      floor: room.floor.number,
      building: room.floor.building.name
    };

    // For demo purposes, we'll add a placeholder QR code value
    // In a real app, you'd generate a proper QR code
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(roomData))}`;

    return NextResponse.json({
      ...room,
      qrCode
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}

// PATCH to update a room
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    const { number, name, type, floorId } = data;

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id }
    });

    if (!existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if floor exists
    if (floorId) {
      const floor = await prisma.floor.findUnique({
        where: { id: floorId }
      });

      if (!floor) {
        return NextResponse.json({ error: 'Floor not found' }, { status: 404 });
      }
    }

    // Update the room
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        number,
        name: name || null,
        type: type || null,
        floorId
      },
      include: {
        floor: {
          include: {
            building: true
          }
        }
      }
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update room', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE a room
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id }
    });

    if (!existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if room has deployed items
    const deploymentCount = await prisma.deploymentRecord.count({
      where: { toRoomId: id }
    });

    if (deploymentCount > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete room with deployed items. Please relocate all items first.'
        },
        { status: 400 }
      );
    }

    // Delete the room
    await prisma.room.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete room', details: String(error) },
      { status: 500 }
    );
  }
}
