import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import logger, { LogAction, LogResource, logAction } from '@/lib/logger';

export interface ApiMiddlewareOptions {
    resource: LogResource;
    requireAuth?: boolean;
}

// Map HTTP methods to log actions
const methodToAction: Record<string, LogAction> = {
    GET: LogAction.READ,
    POST: LogAction.CREATE,
    PUT: LogAction.UPDATE,
    PATCH: LogAction.UPDATE,
    DELETE: LogAction.DELETE,
};

// Get resource name from URL path
function getResourceFromPath(path: string): LogResource | null {
    const pathSegments = path.split('/').filter(Boolean);
    const resourceSegment = pathSegments[ 1 ]?.toLowerCase();

    switch (resourceSegment) {
        case 'users':
            return LogResource.USER;
        case 'buildings':
            return LogResource.BUILDING;
        case 'floors':
            return LogResource.FLOOR;
        case 'rooms':
            return LogResource.ROOM;
        case 'storage':
            return LogResource.STORAGE;
        default:
            return null;
    }
}

export async function apiMiddleware(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
    options?: ApiMiddlewareOptions
) {
    // Extract method and path info
    const method = req.method;
    const url = req.url;
    const path = new URL(url).pathname;
    let userId = 'anonymous';

    try {
        // Try to get user info from Clerk authentication
        const authResult = await auth();
        userId = authResult.userId || 'anonymous';
    } catch (error) {
        // Continue even if auth fails - just log as anonymous
        console.warn('Auth error in middleware:', error);
    }

    // Determine resource type - either from options or from path
    const resource = options?.resource || getResourceFromPath(path);

    // Skip logging if no resource identified
    if (!resource) {
        return handler(req);
    }

    // Infer action from HTTP method
    const action = methodToAction[ method ] || LogAction.READ;

    // Resource ID from path (if available)
    const resourceId = path.split('/').filter(Boolean).slice(2).join('/') || 'all';

    try {
        // Log request
        logAction({
            user: userId,
            action,
            resource,
            message: `${method} ${path}`,
            details: {
                resourceId,
                userAgent: req.headers.get('user-agent'),
                referer: req.headers.get('referer'),
            }
        });

        // Execute the handler
        const response = await handler(req);

        // Log success
        if (response.status >= 200 && response.status < 300) {
            logAction({
                user: userId,
                action,
                resource,
                message: `Success: ${method} ${path} (${response.status})`,
                details: { resourceId, status: response.status }
            });
        } else {
            // Log error responses
            logAction({
                user: userId,
                action,
                resource,
                message: `Error: ${method} ${path} (${response.status})`,
                details: { resourceId, status: response.status }
            });
        }

        return response;
    } catch (error) {
        // Log exceptions
        logger.error(`Exception: ${method} ${path}`, {
            user: userId,
            action,
            resource,
            error: error instanceof Error ? error.message : String(error),
            details: { resourceId }
        });

        throw error;
    }
} 