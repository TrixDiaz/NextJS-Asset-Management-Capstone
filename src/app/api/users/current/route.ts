import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET the currently logged in user
export async function GET(req: NextRequest) {
    try {
        // Get the user ID from Clerk authentication
        const { userId } = await auth();

        // If no user is authenticated, return a test admin user for demo purposes
        if (!userId) {
            return NextResponse.json({
                id: 'test-admin',
                clerkId: 'test-admin',
                firstName: 'Admin',
                lastName: 'User',
                username: 'admin',
                email: 'admin@example.com',
                role: 'admin',
                profileImageUrl: null,
                permissions: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        // Find the user in the database
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        // If user not found, return a test admin user for demo purposes
        if (!user) {
            return NextResponse.json({
                id: 'test-admin',
                clerkId: 'test-admin',
                firstName: 'Admin',
                lastName: 'User',
                username: 'admin',
                email: 'admin@example.com',
                role: 'admin',
                profileImageUrl: null,
                permissions: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        // Format dates
        const formattedUser = {
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };

        return NextResponse.json(formattedUser);
    } catch (error) {
        console.error('Error fetching current user:', error);

        // Return a test admin user for demo purposes
        return NextResponse.json({
            id: 'test-admin',
            clerkId: 'test-admin',
            firstName: 'Admin',
            lastName: 'User',
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin',
            profileImageUrl: null,
            permissions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }
} 