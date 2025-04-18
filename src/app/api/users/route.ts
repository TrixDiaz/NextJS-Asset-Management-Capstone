import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for user creation
const userCreateSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    username: z.string().min(3).optional(),
    email: z.string().email().optional(),
    role: z.enum([ 'admin', 'manager', 'user', 'guest' ]).default('user'),
    clerkId: z.string().optional(),
});

// GET all users
export async function GET(req: NextRequest) {
    try {
        // Check if prisma client is initialized
        if (!prisma || !prisma.user) {
            throw new Error("Prisma client is not properly initialized");
        }

        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');
        const search = searchParams.get('search');

        // Build where clause
        let whereClause: any = {};

        if (role) {
            whereClause.role = role;
        }

        if (search) {
            whereClause.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Fetch users with their permissions
        const users = await prisma.user.findMany({
            where: whereClause,
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Format dates to ensure consistent format
        const formattedUsers = users.map(user => ({
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

// POST create new user
export async function POST(req: NextRequest) {
    try {
        // Check if prisma client is available
        if (!prisma || !prisma.user) {
            throw new Error("Prisma client is not properly initialized");
        }

        const body = await req.json();

        // Validate input
        const result = userCreateSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.format() },
                { status: 400 }
            );
        }

        const { data } = result;

        // Create user
        const newUser = await prisma.user.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                username: data.username,
                email: data.email,
                role: data.role,
                clerkId: data.clerkId || `local_${Date.now().toString()}`, // Generate a pseudo clerkId if not provided
            }
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);

        // Handle duplicate key errors
        if (error instanceof Error && error.message.includes('Unique constraint failed')) {
            return NextResponse.json(
                { error: 'User already exists with that username or email' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create user', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
} 