import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all buildings
export async function GET(req: NextRequest) {
    try {
        const buildings = await prisma.building.findMany({
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(buildings);
    } catch (error) {
        console.error('Error fetching buildings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch buildings' },
            { status: 500 }
        );
    }
}

// POST to create a new building
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { name, code, address } = data;

        if (!name) {
            return NextResponse.json(
                { error: 'Building name is required' },
                { status: 400 }
            );
        }

        // Check if building name already exists
        const existingBuilding = await prisma.building.findFirst({
            where: { name }
        });

        if (existingBuilding) {
            return NextResponse.json(
                { error: 'A building with this name already exists' },
                { status: 409 }
            );
        }

        const building = await prisma.building.create({
            data: {
                name,
                code,
                address
            }
        });

        return NextResponse.json(building, { status: 201 });
    } catch (error) {
        console.error('Error creating building:', error);
        return NextResponse.json(
            { error: 'Failed to create building' },
            { status: 500 }
        );
    }
} 