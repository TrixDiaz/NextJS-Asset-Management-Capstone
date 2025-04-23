import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filename = searchParams.get('filename') || 'download.csv';
  const templateType = searchParams.get('template') || 'storage';

  // Generate CSV content based on template type
  let csvContent = '';

  if (templateType.toLowerCase() === 'storage') {
    // Storage inventory template
    const csvHeader = 'Name,ItemType,Quantity,Unit,Remarks\n';
    const csvRows = [
      'Example Item,Equipment,10,pcs,New items',
      'Medical Supply,Consumable,50,boxes,For emergency use',
      'Office Supply,Stationery,100,pcs,General use'
    ].join('\n');

    csvContent = csvHeader + csvRows;
  } else {
    // Default template
    csvContent = 'No template available for this type';
  }

  // Create response with CSV content
  const response = new NextResponse(csvContent);

  // Set headers for file download
  response.headers.set('Content-Type', 'text/csv; charset=utf-8');
  response.headers.set(
    'Content-Disposition',
    `attachment; filename="${filename}"`
  );

  // This header prevents caching
  response.headers.set('Cache-Control', 'no-store');

  return response;
}
