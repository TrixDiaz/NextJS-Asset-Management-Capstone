import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a specific building
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // @ts-ignore - Using type assertion to bypass TypeScript error
    const building = await (prisma.building as any).findUnique({
      where: { id },
      include: {
        floors: {
          include: {
            rooms: {
              include: {
                assets: true
              }
            }
          }
        }
      }
    });

    if (!building) {
      return NextResponse.json(
        { error: 'Building not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(building);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch building' },
      { status: 500 }
    );
  }
}

// PATCH to update a building
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await req.json();
    const { name, code, address } = data;

    // @ts-ignore - Using type assertion to bypass TypeScript error
    const updatedBuilding = await (prisma.building as any).update({
      where: { id },
      data: {
        name,
        code,
        address
      }
    });

    return NextResponse.json(updatedBuilding);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update building' },
      { status: 500 }
    );
  }
}

// DELETE a building
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // @ts-ignore - Using type assertion to bypass TypeScript error
    await (prisma.building as any).delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete building' },
      { status: 500 }
    );
  }
}
