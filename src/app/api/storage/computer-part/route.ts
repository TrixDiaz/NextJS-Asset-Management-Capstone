import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('Received computer part data:', data);
    const { name, subType, quantity, unit, remarks, serialNumbers } = data;

    if (!name || !subType) {
      return NextResponse.json(
        { error: 'Name and subType are required' },
        { status: 400 }
      );
    }

    // Ensure serialNumbers is always an array
    const safeSerialNumbers = Array.isArray(serialNumbers) ? serialNumbers : [];

    // Validate serial numbers requirement
    if (
      subType &&
      ['SYSTEM_UNIT', 'MONITOR', 'UPS'].includes(subType) &&
      quantity > 0
    ) {
      if (safeSerialNumbers.length < quantity) {
        return NextResponse.json(
          {
            error: `${subType} requires a serial number for each unit (${safeSerialNumbers.length}/${quantity})`
          },
          { status: 400 }
        );
      }
    }

    try {
      // Create storage item using raw query to bypass type issues
      const storageItem = await prisma.$queryRaw`
                INSERT INTO "StorageItem" 
                (id, name, "itemType", "subType", quantity, unit, remarks, "serialNumbers", "createdAt", "updatedAt") 
                VALUES 
                (gen_random_uuid(), ${name}, 'COMPUTER_PART', ${subType}, ${quantity || 0}, ${unit || null}, ${remarks || null}, ${safeSerialNumbers}::text[], NOW(), NOW())
                RETURNING *;
            `;

      console.log('Created computer part:', storageItem);
      return NextResponse.json(storageItem, { status: 201 });
    } catch (prismaError) {
      console.error('Database error:', prismaError);
      return NextResponse.json(
        {
          error: 'Database error creating computer part',
          details: String(prismaError)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating computer part:', error);
    return NextResponse.json(
      { error: 'Failed to create computer part', details: String(error) },
      { status: 500 }
    );
  }
}
