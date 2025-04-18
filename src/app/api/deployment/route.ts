import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all deployment records
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const assetId = searchParams.get('assetId');
        const storageItemId = searchParams.get('storageItemId');
        const toRoomId = searchParams.get('toRoomId');

        let whereClause: any = {};

        if (assetId) {
            whereClause.assetId = assetId;
        }

        if (storageItemId) {
            whereClause.storageItemId = storageItemId;
        }

        if (toRoomId) {
            whereClause.toRoomId = toRoomId;
        }

        const deployments = await prisma.deploymentRecord.findMany({
            where: whereClause,
            include: {
                asset: true,
                storageItem: true
            },
            orderBy: {
                date: 'desc'
            }
        });

        return NextResponse.json(deployments);
    } catch (error) {
        console.error('Error fetching deployment records:', error);
        return NextResponse.json(
            { error: 'Failed to fetch deployment records' },
            { status: 500 }
        );
    }
}

// POST to create a new deployment record
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const {
            assetId,
            storageItemId,
            quantity,
            fromRoomId,
            toRoomId,
            deployedBy,
            remarks
        } = data;

        if ((!assetId && !storageItemId) || !toRoomId || !deployedBy) {
            return NextResponse.json(
                { error: 'Either asset ID or storage item ID, destination room ID, and deployed by are required' },
                { status: 400 }
            );
        }

        // Check if destination room exists
        const toRoom = await prisma.room.findUnique({
            where: { id: toRoomId }
        });

        if (!toRoom) {
            return NextResponse.json(
                { error: 'Destination room not found' },
                { status: 404 }
            );
        }

        // Create deployment record in transaction to ensure data consistency
        let result;

        // If deploying a storage item, update its quantity
        if (storageItemId) {
            // Verify storage item exists and has enough quantity
            const storageItem = await prisma.storageItem.findUnique({
                where: { id: storageItemId }
            });

            if (!storageItem) {
                return NextResponse.json(
                    { error: 'Storage item not found' },
                    { status: 404 }
                );
            }

            const deployQty = quantity || 1;

            if (storageItem.quantity < deployQty) {
                return NextResponse.json(
                    { error: `Not enough quantity available. Requested: ${deployQty}, Available: ${storageItem.quantity}` },
                    { status: 400 }
                );
            }

            // Update storage item quantity and create deployment record
            result = await prisma.$transaction(async (tx) => {
                // Reduce quantity in storage
                const updatedItem = await tx.storageItem.update({
                    where: { id: storageItemId },
                    data: {
                        quantity: {
                            decrement: deployQty
                        }
                    }
                });

                // Create deployment record
                const deploymentRecord = await tx.deploymentRecord.create({
                    data: {
                        storageItemId,
                        quantity: deployQty,
                        fromRoomId,
                        toRoomId,
                        date: new Date(),
                        deployedBy,
                        remarks
                    }
                });

                return { updatedItem, deploymentRecord };
            });
        }
        // If deploying an asset, update its room
        else if (assetId) {
            // Verify asset exists
            const asset = await prisma.asset.findUnique({
                where: { id: assetId }
            });

            if (!asset) {
                return NextResponse.json(
                    { error: 'Asset not found' },
                    { status: 404 }
                );
            }

            // Update asset room and create deployment record
            result = await prisma.$transaction(async (tx) => {
                // Update asset location
                const updatedAsset = await tx.asset.update({
                    where: { id: assetId },
                    data: {
                        roomId: toRoomId
                    }
                });

                // Create deployment record
                const deploymentRecord = await tx.deploymentRecord.create({
                    data: {
                        assetId,
                        quantity: 1,
                        fromRoomId,
                        toRoomId,
                        date: new Date(),
                        deployedBy,
                        remarks
                    }
                });

                return { updatedAsset, deploymentRecord };
            });
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating deployment record:', error);
        return NextResponse.json(
            { error: 'Failed to create deployment record' },
            { status: 500 }
        );
    }
} 