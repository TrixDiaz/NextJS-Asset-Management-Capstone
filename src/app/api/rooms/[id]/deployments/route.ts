import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all deployments for a room
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if room exists
    const roomExists = await prisma.room.findUnique({
      where: { id }
    });

    if (!roomExists) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Get all deployment records for this room using raw query for better joins
    const deployments = await prisma.$queryRaw`
            SELECT 
                dr.id, 
                dr.quantity, 
                dr."serialNumber", 
                dr.date, 
                dr."deployedBy", 
                dr.remarks,
                si.id as "storageItemId",
                si.name as "storageItemName",
                si."itemType", 
                si."subType",
                si.unit
            FROM "DeploymentRecord" dr
            JOIN "StorageItem" si ON dr."storageItemId" = si.id
            WHERE dr."toRoomId" = ${id}
            ORDER BY dr.date DESC
        `;

    return NextResponse.json(deployments);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch deployments' },
      { status: 500 }
    );
  }
}
