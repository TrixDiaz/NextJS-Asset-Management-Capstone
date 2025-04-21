import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storageItemId, quantity, roomId, serialNumber, remarks } = body;

    console.log('Received deployment request:', body);

    // Validate input
    if (!storageItemId || !quantity || !roomId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Default deployer name
    const deployedBy = 'System User';

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      try {
        // Check if storage item exists using raw query
        const storageItems = await tx.$queryRaw`
                    SELECT * FROM "StorageItem" WHERE id = ${storageItemId};
                `;

        if (!storageItems || (storageItems as any[]).length === 0) {
          throw new Error('Storage item not found');
        }

        const storageItem = (storageItems as any[])[0];
        console.log(
          'Found storage item:',
          JSON.stringify(storageItem, null, 2)
        );

        if (storageItem.quantity < quantity) {
          throw new Error('Not enough quantity available');
        }

        // Check if room exists
        const rooms = await tx.$queryRaw`
                    SELECT * FROM "Room" WHERE id = ${roomId};
                `;

        if (!rooms || (rooms as any[]).length === 0) {
          throw new Error('Room not found');
        }

        // Check if serial number is required for this item type
        const isComputerPart = storageItem.itemType === 'COMPUTER_PART';
        const isRequiredPartType =
          storageItem.subType &&
          ['SYSTEM_UNIT', 'MONITOR', 'UPS'].includes(storageItem.subType);
        const serialRequired = isComputerPart && isRequiredPartType;

        // Validate serial number is provided when required
        if (serialRequired && !serialNumber) {
          throw new Error(
            `Serial number is required for ${storageItem.subType}`
          );
        }

        // If a serial number is provided, validate it exists for this item
        if (serialNumber) {
          const serialNumbers = storageItem.serialNumbers || [];
          if (!serialNumbers.includes(serialNumber)) {
            throw new Error('Invalid serial number');
          }

          // For items with serial numbers, we only deploy one at a time
          if (quantity > 1) {
            throw new Error(
              'Can only deploy one item when specifying a serial number'
            );
          }

          // Remove the serial number from the storage item
          const updatedSerialNumbers = serialNumbers.filter(
            (s: string) => s !== serialNumber
          );

          // Update storage item quantity and serial numbers using raw query
          await tx.$queryRaw`
                        UPDATE "StorageItem"
                        SET 
                            quantity = quantity - ${quantity},
                            "serialNumbers" = ${updatedSerialNumbers}::text[],
                            "updatedAt" = NOW()
                        WHERE id = ${storageItemId};
                    `;
        } else {
          // Update storage item quantity only using raw query
          await tx.$queryRaw`
                        UPDATE "StorageItem"
                        SET 
                            quantity = quantity - ${quantity},
                            "updatedAt" = NOW()
                        WHERE id = ${storageItemId};
                    `;
        }

        // Create deployment record using raw query
        const deploymentRecords = await tx.$queryRaw`
                    INSERT INTO "DeploymentRecord"
                    (id, "storageItemId", quantity, "serialNumber", "toRoomId", date, "deployedBy", remarks, "createdAt", "updatedAt")
                    VALUES
                    (gen_random_uuid(), ${storageItemId}, ${quantity}, ${serialNumber || null}, ${roomId}, NOW(), ${deployedBy}, ${remarks || null}, NOW(), NOW())
                    RETURNING *;
                `;

        const deploymentRecord = (deploymentRecords as any[])[0];
        return { deploymentRecord };
      } catch (error) {
        console.error('Transaction error:', error);
        throw error;
      }
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in deployments API:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
