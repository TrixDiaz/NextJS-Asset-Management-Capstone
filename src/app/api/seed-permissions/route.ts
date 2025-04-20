import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as permConstants from '@/constants/permissions';
import { PERMISSION_DISPLAY_NAMES, PERMISSION_GROUPS } from '@/constants/permissions';

// This endpoint will seed all permissions into the database
export async function POST(req: NextRequest) {
    try {
        // Get all permission codes from the constants
        const allPermissions = Object.entries(permConstants)
            .filter(([ key, value ]) =>
                typeof value === 'string' &&
                key === key.toUpperCase() &&
                ![ 'ADMIN_PERMISSIONS', 'MANAGER_PERMISSIONS', 'USER_PERMISSIONS', 'GUEST_PERMISSIONS',
                    'PERMISSION_GROUPS', 'PERMISSION_DISPLAY_NAMES' ].includes(key)
            )
            .map(([ key, code ]) => ({
                code: code as string,
                name: PERMISSION_DISPLAY_NAMES[ code as string ] || key,
                description: PERMISSION_DISPLAY_NAMES[ code as string ] || key,
            }));

        // Create or update permissions in the database
        const results = await Promise.all(
            allPermissions.map(async (perm) => {
                return await prisma.permission.upsert({
                    where: { code: perm.code },
                    update: {
                        name: perm.name,
                        description: perm.description,
                    },
                    create: {
                        code: perm.code,
                        name: perm.name,
                        description: perm.description,
                    },
                });
            })
        );

        return NextResponse.json({
            success: true,
            message: `Created/updated ${results.length} permissions`,
            permissions: results,
        });
    } catch (error) {
        console.error('Error seeding permissions:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to seed permissions',
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
} 