import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { User, Building, Floor, Room } from '@prisma/client';

export async function GET(req: NextRequest) {
    try {
        console.log("Starting database seeding...");

        // Check if prisma client is initialized
        if (!prisma) {
            return NextResponse.json(
                { success: false, error: "Database connection not initialized" },
                { status: 500 }
            );
        }

        // Check if we already have buildings and users
        let buildingCount = 0;
        let userCount = 0;

        try {
            buildingCount = await prisma.building.count();
            userCount = await prisma.user.count();
        } catch (error) {
            console.error("Error counting existing records:", error);
            return NextResponse.json(
                {
                    success: false,
                    error: "Error accessing database. Please check your database connection.",
                    details: error instanceof Error ? error.message : String(error)
                },
                { status: 500 }
            );
        }

        let building: Building | null = null;
        let floor: Floor | null = null;
        let room: Room | null = null;
        let user: User | null = null;

        const results: {
            created: {
                buildings: Building[];
                floors: Floor[];
                rooms: Room[];
                users: User[];
            };
            existing: {
                buildings: number;
                floors: number;
                rooms: number;
                users: number;
            };
        } = {
            created: {
                buildings: [],
                floors: [],
                rooms: [],
                users: []
            },
            existing: {
                buildings: 0,
                floors: 0,
                rooms: 0,
                users: 0
            }
        };

        // Create a sample user if none exists
        if (userCount === 0) {
            try {
                user = await prisma.user.create({
                    data: {
                        clerkId: 'sample_clerk_id',
                        firstName: 'John',
                        lastName: 'Doe',
                        username: 'johndoe',
                        email: 'john.doe@example.com',
                        role: 'admin',
                    }
                });
                results.created.users.push(user);
            } catch (error) {
                console.error("Error creating user:", error);
                // Continue even if user creation failed
            }
        } else {
            // Get first user if exists
            try {
                user = await prisma.user.findFirst();
                results.existing.users = userCount;
            } catch (error) {
                console.error("Error finding user:", error);
            }
        }

        // If no buildings exist, create sample data
        if (buildingCount === 0) {
            try {
                // Create a building
                building = await prisma.building.create({
                    data: {
                        name: 'Sample Building',
                        code: 'SB-001',
                        address: '123 Main Street',
                    }
                });

                results.created.buildings.push(building);

                // Create a floor in this building
                floor = await prisma.floor.create({
                    data: {
                        number: 1,
                        name: 'First Floor',
                        buildingId: building.id,
                    }
                });

                results.created.floors.push(floor);

                // Create a room on this floor
                room = await prisma.room.create({
                    data: {
                        name: 'Classroom 101',
                        number: '101',
                        type: 'CLASSROOM',
                        floorId: floor.id,
                    }
                });

                results.created.rooms.push(room);
            } catch (error) {
                console.error("Error creating building/floor/room:", error);
                // Continue execution to return what we have
            }
        } else {
            // Count existing data
            try {
                results.existing.buildings = buildingCount;
                results.existing.floors = await prisma.floor.count();
                results.existing.rooms = await prisma.room.count();

                // Get first room if exists for schedule creation
                if (results.existing.rooms > 0) {
                    room = await prisma.room.findFirst();
                }
            } catch (error) {
                console.error("Error counting existing records:", error);
            }
        }

        // Final result
        const hasCreatedData = results.created.users.length > 0 ||
            results.created.buildings.length > 0 ||
            results.created.floors.length > 0 ||
            results.created.rooms.length > 0;

        return NextResponse.json({
            success: true,
            message: hasCreatedData
                ? 'Sample data created successfully'
                : 'Sample data already exists',
            results,
            sampleData: {
                userId: user?.id,
                roomId: room?.id
            }
        });
    } catch (error) {
        console.error('Error seeding database:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to seed database',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
} 