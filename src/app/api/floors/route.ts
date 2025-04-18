import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all floors
export async function GET(req: NextRequest) {
    try {
        // Get search params for filtering
        const { searchParams } = new URL(req.url);
        const buildingId = searchParams.get('buildingId');

        // Build where clause based on filters
        let whereClause = {};

        if (buildingId) {
            whereClause = { buildingId };
        }

        // Get all floors with their building
        const floors = await prisma.floor.findMany({
            where: whereClause,
            include: {
                building: true
            },
            orderBy: [
                { building: { name: 'asc' } },
                { number: 'asc' }
            ]
        });

        return NextResponse.json(floors);
    } catch (error) {
        console.error('Error fetching floors:', error);
        return NextResponse.json(
            { error: 'Failed to fetch floors', details: String(error) },
            { status: 500 }
        );
    }
}

// POST to create a new floor
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { number, name, buildingId } = data;

        if (!buildingId || number === undefined) {
            return NextResponse.json(
                { error: 'Building ID and floor number are required' },
                { status: 400 }
            );
        }

        // Verify the building exists
        const building = await prisma.building.findUnique({
            where: { id: buildingId }
        });

        if (!building) {
            return NextResponse.json(
                { error: 'Building not found' },
                { status: 404 }
            );
        }

        // Create the floor
        const floor = await prisma.floor.create({
            data: {
                number,
                name: name || null,
                buildingId
            },
            include: {
                building: true
            }
        });

        return NextResponse.json(floor, { status: 201 });
    } catch (error) {
        console.error('Error creating floor:', error);
        return NextResponse.json(
            { error: 'Failed to create floor', details: String(error) },
            { status: 500 }
        );
    }
} 