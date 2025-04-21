import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const data = await request.json();
        const { name, subType, quantity, unit, remarks, serialNumbers } = data;

        // Check if storage item exists
        const existingItem = await prisma.storageItem.findUnique({
            where: { id }
        });

        if (!existingItem) {
            return NextResponse.json(
                { error: 'Storage item not found' },
                { status: 404 }
            );
        }

        // Ensure serialNumbers is an array
        const safeSerialNumbers = Array.isArray(serialNumbers) ? serialNumbers : [];

        // Validate serial numbers requirement
        if (subType && [ 'SYSTEM_UNIT', 'MONITOR', 'UPS' ].includes(subType) && quantity > 0) {
            if (safeSerialNumbers.length < quantity) {
                return NextResponse.json(
                    { error: `${subType} requires a serial number for each unit (${safeSerialNumbers.length}/${quantity})` },
                    { status: 400 }
                );
            }
        }

        try {
            // Update storage item using raw query to bypass type issues
            const updatedItem = await prisma.$queryRaw`
                UPDATE "StorageItem"
                SET 
                    name = ${name},
                    "subType" = ${subType || null},
                    quantity = ${quantity || 0},
                    unit = ${unit || null},
                    remarks = ${remarks || null},
                    "serialNumbers" = ${safeSerialNumbers}::text[],
                    "updatedAt" = NOW()
                WHERE id = ${id}
                RETURNING *;
            `;

            return NextResponse.json(updatedItem);
        } catch (prismaError) {
            return NextResponse.json(
                { error: 'Database error updating computer part', details: String(prismaError) },
                { status: 500 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update computer part', details: String(error) },
            { status: 500 }
        );
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const computerPart = await prisma.storageItem.findUnique({
            where: { id, itemType: 'COMPUTER_PART' }
        });

        if (!computerPart) {
            return NextResponse.json(
                { error: 'Computer part not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(computerPart);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch computer part' },
            { status: 500 }
        );
    }
} 