import { NextRequest, NextResponse } from 'next/server';
import { db, checkDbConnection } from '@/lib/db';

export async function GET(req: NextRequest) {
  const dbStatus = {
    connected: false,
    queryTime: 0,
    error: null as string | null,
    version: null as string | null
  };

  const startTime = Date.now();

  try {
    // Check basic connectivity
    dbStatus.connected = await checkDbConnection();

    if (dbStatus.connected) {
      // Try to get PostgreSQL version
      const versionResult = (await db.$queryRaw`SELECT version()`) as any[];
      if (versionResult && versionResult.length > 0) {
        dbStatus.version = versionResult[0].version;
      }
    }

    dbStatus.queryTime = Date.now() - startTime;

    return NextResponse.json(
      {
        success: dbStatus.connected,
        message: dbStatus.connected
          ? 'Database connection is working'
          : 'Database connection failed',
        dbStatus
      },
      { status: dbStatus.connected ? 200 : 503 }
    );
  } catch (error) {
    dbStatus.queryTime = Date.now() - startTime;
    dbStatus.error = error instanceof Error ? error.message : String(error);
    console.error('Database connection error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to connect to database',
        dbStatus
      },
      { status: 503 }
    );
  }
}
