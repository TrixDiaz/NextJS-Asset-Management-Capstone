import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a specific storage item
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        const storageItem = await prisma.storageItem.findUnique({
            where: { id },
            include: {
                deploymentHistory: {
                    orderBy: {
                        date: 'desc'
                    }
                }
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
            { error: 'Failed to fetch storage item' },
            { status: 500 }
        );
    }
}

// PATCH to update a storage item
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const data = await req.json();
        const { name, itemType, quantity, unit, remarks } = data;

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

        // Update the storage item
        const updatedItem = await prisma.storageItem.update({
            where: { id },
            data: {
                name,
                itemType,
                quantity: quantity ?? 0,
                unit,
                remarks
            }
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        console.error('Error updating storage item:', error);
        return NextResponse.json(
            { error: 'Failed to update storage item' },
            { status: 500 }
        );
    }
}

// DELETE a storage item
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

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