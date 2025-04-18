import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        console.log("Starting database seeding...");

        // Check if we already have buildings
        const buildingCount = await prisma.building.count();

        let building;
        let floor;
        let room;

        const results = {
            created: {
                buildings: [],
                floors: [],
                rooms: []
            },
            existing: {
                buildings: 0,
                floors: 0,
                rooms: 0
            }
        };

        // If no buildings exist, create sample data
        if (buildingCount === 0) {
            // Create a building
            building = await prisma.building.create({
                data: {
                    name: 'Sample Building',
                    address: '123 Main Street',
                    city: 'Sample City',
                    state: 'Sample State',
                    zipCode: '12345',
                },
            });

            results.created.buildings.push(building);

            // Create a floor in this building
            floor = await prisma.floor.create({
                data: {
                    name: 'First Floor',
                    level: 1,
                    buildingId: building.id,
                },
            });

            results.created.floors.push(floor);

            // Create a room on this floor
            room = await prisma.room.create({
                data: {
                    name: 'Sample Room 101',
                    roomNumber: '101',
                    floorId: floor.id,
                    capacity: 4,
                    type: 'STORAGE',
                },
            });

            results.created.rooms.push(room);
        } else {
            // Count existing data
            results.existing.buildings = buildingCount;
            results.existing.floors = await prisma.floor.count();
            results.existing.rooms = await prisma.room.count();
        }

        return NextResponse.json({
            success: true,
            message: buildingCount === 0
                ? 'Sample data created successfully'
                : 'Sample data already exists',
            results
        });
    } catch (error) {
        console.error('Error seeding database:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to seed database' },
            { status: 500 }
        );
    }
} 