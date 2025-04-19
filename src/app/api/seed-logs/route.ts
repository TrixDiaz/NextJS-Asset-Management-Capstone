import { NextRequest, NextResponse } from 'next/server';
import { LogAction, LogResource, logAction } from '@/lib/logger';

// Sample user IDs
const userIds = [
    'user_1',
    'user_2',
    'user_3',
    'clerk_123',
    'admin_user',
    'guest_user',
];

// Sample messages for different actions and resources
const messages = {
    [ LogAction.LOGIN ]: [ 'User logged in', 'Successful login' ],
    [ LogAction.LOGOUT ]: [ 'User logged out', 'Session ended' ],
    [ LogAction.CREATE ]: [ 'Created new {resource}', 'Added {resource}', 'New {resource} created' ],
    [ LogAction.READ ]: [ 'Viewed {resource}', 'Accessed {resource} data', 'Fetched {resource} information' ],
    [ LogAction.UPDATE ]: [ 'Updated {resource}', 'Modified {resource}', 'Changed {resource} details' ],
    [ LogAction.DELETE ]: [ 'Deleted {resource}', 'Removed {resource}', 'Permanently deleted {resource}' ],
};

// Sample details for different resources with a Record type to avoid TypeScript errors
const details: Record<LogResource, Record<string, any>[]> = {
    [ LogResource.USER ]: [
        { id: 'usr_123', name: 'John Doe', email: 'john@example.com' },
        { id: 'usr_456', name: 'Jane Smith', role: 'admin' },
        { id: 'usr_789', name: 'Alice Johnson', department: 'Sales' },
    ],
    [ LogResource.BUILDING ]: [
        { id: 'bld_123', name: 'Headquarters', location: 'New York' },
        { id: 'bld_456', name: 'Branch Office', floors: 5 },
        { id: 'bld_789', name: 'Warehouse', type: 'Storage' },
    ],
    [ LogResource.FLOOR ]: [
        { id: 'flr_123', number: 1, building: 'Headquarters' },
        { id: 'flr_456', number: 2, capacity: 50 },
        { id: 'flr_789', number: 3, department: 'Engineering' },
    ],
    [ LogResource.ROOM ]: [
        { id: 'rm_123', name: 'Conference Room A', capacity: 15 },
        { id: 'rm_456', name: 'Office 101', occupant: 'John Doe' },
        { id: 'rm_789', name: 'Storage Room', purpose: 'Equipment' },
    ],
    [ LogResource.STORAGE ]: [
        { id: 'str_123', name: 'Main Storage', capacity: '500 sqft' },
        { id: 'str_456', name: 'Archive Room', contents: 'Documents' },
        { id: 'str_789', name: 'Supply Closet', inventory: 'Office supplies' },
    ],
};

// Pick a random item from an array
function pickRandom<T>(arr: T[]): T {
    return arr[ Math.floor(Math.random() * arr.length) ];
}

// Generate a random date within the last 7 days
function getRandomDate(): Date {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
    return new Date(now.getTime() - daysAgo);
}

// Generate a random log
function generateRandomLog() {
    const action = pickRandom(Object.values(LogAction));
    const resource = pickRandom(Object.values(LogResource));
    const userId = pickRandom(userIds);

    const messageTemplates = messages[ action ];
    let message = pickRandom(messageTemplates);
    message = message.replace('{resource}', resource);

    const resourceDetails = details[ resource ];
    const detail = pickRandom(resourceDetails);

    // Set the timestamp to a random recent date for variety
    const logDate = getRandomDate();

    // Add timestamp to the logger
    logAction({
        user: userId,
        action,
        resource,
        message,
        details: {
            ...detail,
            timestamp: logDate.toISOString(),
        },
    });

    return {
        user: userId,
        action,
        resource,
        message,
        details: detail,
    };
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const count = parseInt(searchParams.get('count') || '20', 10);

        const logs = [];

        // Generate the specified number of logs
        for (let i = 0; i < count; i++) {
            logs.push(generateRandomLog());
        }

        return NextResponse.json({
            success: true,
            message: `Generated ${count} sample logs`,
            logs,
        });
    } catch (error) {
        console.error('Error generating sample logs:', error);
        return NextResponse.json(
            { error: 'Failed to generate sample logs' },
            { status: 500 }
        );
    }
} 