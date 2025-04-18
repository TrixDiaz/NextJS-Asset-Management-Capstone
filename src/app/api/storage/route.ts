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
        const { name, itemType, quantity, unit, remarks } = data;

        if (!name || !itemType) {
            return NextResponse.json(
                { error: 'Name and item type are required' },
                { status: 400 }
            );
        }

        // @ts-ignore - Using type assertion to bypass TypeScript error
        const storageItem = await (prisma.storageItem as any).create({
            data: {
                name,
                itemType,
                quantity: quantity || 0,
                unit,
                remarks
            }
        });

        return NextResponse.json(storageItem, { status: 201 });
    } catch (error) {
        console.error('Error creating storage item:', error);
        return NextResponse.json(
            { error: 'Failed to create storage item' },
            { status: 500 }
        );
    }
} 