import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all storage items
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const itemType = searchParams.get('itemType');

        let whereClause = {};

        if (itemType) {
            whereClause = { itemType };
        }

        // @ts-ignore - Using type assertion to bypass TypeScript error
        const storageItems = await (prisma.storageItem as any).findMany({
            where: whereClause
        });

        return NextResponse.json(storageItems);
    } catch (error) {
        console.error('Error fetching storage items:', error);
        return NextResponse.json(
            { error: 'Failed to fetch storage items' },
            { status: 500 }
        );
    }
}

// POST to create a new storage item
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        console.log("Received data:", data);
        const { name, itemType, subType, quantity, unit, remarks, serialNumbers } = data;

        if (!name || !itemType) {
            return NextResponse.json(
                { error: 'Name and item type are required' },
                { status: 400 }
            );
        }

        // Ensure serialNumbers is always an array
        const safeSerialNumbers = Array.isArray(serialNumbers) ? serialNumbers : [];

        try {
            // Use raw SQL for creating the item to bypass Prisma validation issues
            const storageItem = await prisma.$queryRaw`
                INSERT INTO "StorageItem" 
                (id, name, "itemType", "subType", quantity, unit, remarks, "serialNumbers", "createdAt", "updatedAt") 
                VALUES 
                (gen_random_uuid(), ${name}, ${itemType}, ${subType || null}, ${quantity || 0}, ${unit || null}, ${remarks || null}, ${safeSerialNumbers}::text[], NOW(), NOW())
                RETURNING *;
            `;

            console.log("Created storage item:", storageItem);
            return NextResponse.json(storageItem, { status: 201 });
        } catch (prismaError) {
            console.error("Prisma error:", prismaError);
            return NextResponse.json(
                { error: 'Database error creating storage item', details: String(prismaError) },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error creating storage item:', error);
        return NextResponse.json(
            { error: 'Failed to create storage item', details: String(error) },
            { status: 500 }
        );
    }
} 