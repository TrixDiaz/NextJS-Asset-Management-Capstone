import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a specific storage item
export async function GET(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const { id } = context.params;

        // Using any because Prisma types might not be updated
        const storageItem = await (prisma.storageItem as any).findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                itemType: true,
                subType: true,
                quantity: true,
                unit: true,
                remarks: true,
                serialNumbers: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!storageItem) {
            return NextResponse.json(
                { error: 'Storage item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(storageItem);
    } catch (error) {
        console.error('Error fetching storage item:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching the storage item' },
            { status: 500 }
        );
    }
}

// PATCH to update a storage item
export async function PATCH(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const { id } = context.params;
        const data = await req.json();
        console.log("Update data received:", data);
        const { name, itemType, subType, quantity, unit, remarks, serialNumbers } = data;

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

        try {
            // Use raw SQL for updating the item to bypass Prisma validation issues
            const updatedItem = await prisma.$queryRaw`
                UPDATE "StorageItem"
                SET 
                    name = ${name},
                    "itemType" = ${itemType},
                    "subType" = ${subType || null},
                    quantity = ${quantity ?? 0},
                    unit = ${unit || null},
                    remarks = ${remarks || null},
                    "serialNumbers" = ${safeSerialNumbers}::text[],
                    "updatedAt" = NOW()
                WHERE id = ${id}
                RETURNING *;
            `;

            return NextResponse.json(updatedItem);
        } catch (prismaError) {
            console.error("Prisma update error:", prismaError);
            return NextResponse.json(
                { error: 'Database error updating storage item', details: String(prismaError) },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error updating storage item:', error);
        return NextResponse.json(
            { error: 'Failed to update storage item', details: String(error) },
            { status: 500 }
        );
    }
}

// DELETE a storage item
export async function DELETE(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const { id } = context.params;

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

        // Check if item has deployment history
        const deploymentCount = await prisma.deploymentRecord.count({
            where: { storageItemId: id }
        });

        if (deploymentCount > 0) {
            return NextResponse.json(
                {
                    error: 'Cannot delete storage item with deployment history. Consider setting quantity to 0 instead.'
                },
                { status: 400 }
            );
        }

        // Delete the storage item
        await prisma.storageItem.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting storage item:', error);
        return NextResponse.json(
            { error: 'Failed to delete storage item' },
            { status: 500 }
        );
    }
} 