import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRole } from '@/utils/roles';

// Helper function to parse CSV
function parseCSV(csvText: string) {
  const lines = csvText.split('\n');
  if (lines.length < 2) {
    return { data: [], errors: [{ message: 'Empty CSV file' }] };
  }

  // Parse headers (first line)
  const headers = lines[0].split(',').map((h) => h.trim());

  // Parse data rows
  const data = lines
    .slice(1)
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      return row;
    });

  return { data, errors: [] };
}

export async function POST(request: NextRequest) {
  try {
    // Check if user has admin or moderator role
    const isAdmin = await checkRole('admin');
    const isModerator = await checkRole('moderator');

    // Return unauthorized if user doesn't have required roles
    if (!isAdmin && !isModerator) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get import type from query params
    const type = request.nextUrl.searchParams.get('type') || '';

    // Handle only supported import types
    if (type.toLowerCase() !== 'storage') {
      return NextResponse.json(
        { message: `Import type '${type}' not supported` },
        { status: 400 }
      );
    }

    // Get the form data with the file
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Parse the CSV file
    const csvText = await file.text();
    const { data, errors } = parseCSV(csvText);

    if (errors.length > 0) {
      return NextResponse.json(
        { message: 'Invalid CSV format', errors },
        { status: 400 }
      );
    }

    // Process storage items
    if (type.toLowerCase() === 'storage') {
      // Validate required fields
      const validItems = data.filter(
        (item: any) => item.Name && item.ItemType && item.Quantity
      );

      if (validItems.length === 0) {
        return NextResponse.json(
          { message: 'No valid items found in CSV' },
          { status: 400 }
        );
      }

      // Prepare items for database
      const storageItems = validItems.map((item: any) => ({
        name: item.Name.trim(),
        itemType: item.ItemType.trim(),
        quantity: parseInt(item.Quantity, 10) || 0,
        unit: item.Unit ? item.Unit.trim() : null,
        remarks: item.Remarks ? item.Remarks.trim() : null
      }));

      // Import items to database
      const result = await prisma.storageItem.createMany({
        data: storageItems,
        skipDuplicates: true
      });

      return NextResponse.json({
        message: 'Import successful',
        imported: result.count,
        total: validItems.length
      });
    }

    return NextResponse.json(
      { message: 'Unknown import type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { message: 'Failed to import CSV', error: (error as Error).message },
      { status: 500 }
    );
  }
}
