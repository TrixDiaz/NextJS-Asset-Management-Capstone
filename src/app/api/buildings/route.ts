import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all buildings
export async function GET(req: NextRequest) {
    try {
        // @ts-ignore - Using type assertion to bypass TypeScript error
        const buildings = await (prisma.building as any).findMany({
            include: {
                floors: {
                    include: {
                        rooms: true
                    }
                }
            }
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

        // @ts-ignore - Using type assertion to bypass TypeScript error
        const building = await (prisma.building as any).create({
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