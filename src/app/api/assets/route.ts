import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all assets or assets by room ID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const status = searchParams.get('status');
    const assetType = searchParams.get('assetType');

    let whereClause: any = {};

    if (roomId) {
      whereClause.roomId = roomId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (assetType) {
      whereClause.assetType = assetType;
    }

    const assets = await prisma.asset.findMany({
      where: whereClause,
      include: {
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

    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

// POST to create a new asset
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      assetTag,
      assetType,
      systemUnit,
      ups,
      monitor,
      status,
      remarks,
      roomId
    } = data;

    if (!roomId || !assetType) {
      return NextResponse.json(
        { error: 'Room ID and asset type are required' },
        { status: 400 }
      );
    }

    // Verify the room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const asset = await prisma.asset.create({
      data: {
        assetTag,
        assetType,
        systemUnit,
        ups,
        monitor,
        status: status || 'WORKING',
        remarks,
        roomId
      }
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}
