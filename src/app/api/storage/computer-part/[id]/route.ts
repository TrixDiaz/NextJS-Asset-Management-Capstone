import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const data = await req.json();
        console.log("Update computer part data:", data);
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

            console.log("Updated computer part:", updatedItem);
            return NextResponse.json(updatedItem);
        } catch (prismaError) {
            console.error("Database error:", prismaError);
            return NextResponse.json(
                { error: 'Database error updating computer part', details: String(prismaError) },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error updating computer part:', error);
        return NextResponse.json(
            { error: 'Failed to update computer part', details: String(error) },
            { status: 500 }
        );
    }
} 