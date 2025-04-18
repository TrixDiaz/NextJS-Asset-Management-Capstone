import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all floors or floors by building ID
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const buildingId = searchParams.get('buildingId');

        const whereClause = buildingId ? { buildingId } : {};

        const floors = await prisma.floor.findMany({
            where: whereClause,
            include: {
                building: true,
                rooms: true
            }
        });

        return NextResponse.json(floors);
    } catch (error) {
        console.error('Error fetching floors:', error);
        return NextResponse.json(
            { error: 'Failed to fetch floors' },
            { status: 500 }
        );
    }
}

// POST to create a new floor
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { number, name, buildingId } = data;

        if (!buildingId || !number) {
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

        const floor = await prisma.floor.create({
            data: {
                number,
                name,
                buildingId
            }
        });

        return NextResponse.json(floor, { status: 201 });
    } catch (error) {
        console.error('Error creating floor:', error);
        return NextResponse.json(
            { error: 'Failed to create floor' },
            { status: 500 }
        );
    }
} 