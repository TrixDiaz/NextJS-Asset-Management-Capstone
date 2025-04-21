import { NextRequest, NextResponse } from 'next/server';
import {
  getLogs,
  LogAction,
  LogResource,
  LogLevel,
  LogEntry
} from '@/lib/logger';
import { apiMiddleware } from '../middleware';

async function handleGET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Extract filtering params from the request
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const level = searchParams.get('level') as LogLevel | undefined;
    const action = searchParams.get('action') as LogAction | undefined;
    const resource = searchParams.get('resource') as LogResource | undefined;
    const user = searchParams.get('user') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') as keyof LogEntry | undefined;
    const sortOrder = searchParams.get('sortOrder') as
      | 'asc'
      | 'desc'
      | undefined;

    // Get logs with filtering and pagination
    const result = getLogs({
      page,
      limit,
      level,
      action,
      resource,
      user,
      search,
      sortBy,
      sortOrder
    });

    // Return logs with pagination metadata
    return NextResponse.json({
      data: result.logs,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

// Export the GET handler with middleware
export function GET(req: NextRequest) {
  return apiMiddleware(req, handleGET, { resource: LogResource.USER });
}
