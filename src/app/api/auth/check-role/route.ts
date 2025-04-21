import { NextRequest, NextResponse } from 'next/server';
import { checkRole } from '@/utils/roles';
import { Roles } from '@/utils/roles';

export async function GET(request: NextRequest) {
  try {
    // Get the role from the query parameter
    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get('role');

    if (!roleParam) {
      return NextResponse.json(
        { error: 'Role parameter is required' },
        { status: 400 }
      );
    }

    // Handle multiple roles (comma-separated)
    const roles = roleParam.split(',') as Roles[];

    // Check each role until we find one the user has
    let hasRole = false;
    for (const role of roles) {
      if (await checkRole(role)) {
        hasRole = true;
        break;
      }
    }

    return NextResponse.json({ hasRole });
  } catch (error) {
    console.error('Error checking role:', error);
    return NextResponse.json(
      {
        error: 'Failed to check role',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
