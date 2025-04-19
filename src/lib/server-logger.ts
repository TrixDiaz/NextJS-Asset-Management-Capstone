import { auth } from '@clerk/nextjs/server';
import logger, { LogAction, LogResource, logAction } from './logger';

/**
 * Server-side action logger for Next.js server components and serverless functions
 * Compatible with both Node.js and Edge Runtime
 */
export async function logServerAction({
    action,
    resource,
    message,
    details,
}: {
    action: LogAction;
    resource: LogResource;
    message: string;
    details?: Record<string, any>;
}) {
    try {
        // Get user ID from Clerk authentication
        const { userId } = await auth();

        // Log the action
        logAction({
            user: userId || 'server-action',
            action,
            resource,
            message,
            details,
        });
    } catch (error) {
        // If auth fails, still log but without user ID
        logAction({
            user: 'server-action-auth-error',
            action,
            resource,
            message,
            details: {
                ...details,
                authError: error instanceof Error ? error.message : 'Unknown auth error'
            },
        });
    }
}

export { LogAction, LogResource };
export default logger; 