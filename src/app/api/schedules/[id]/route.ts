import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';

// Schema for schedule update
const scheduleUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  startTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Start time must be a valid date string'
    })
    .optional(),
  endTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'End time must be a valid date string'
    })
    .optional(),
  dayOfWeek: z
    .enum([ 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday' ])
    .optional(),
  roomId: z.string().optional()
});

// GET a single schedule
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const schedule = await prisma.schedule.findUnique({
      where: {
        id
      },
      include: {
        room: true,
        user: true
      }
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH update a schedule
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();

    // Check if schedule exists
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id }
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Add authorization check here

    // Validate the data
    const scheduleSchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum([ 'pending', 'approved', 'rejected', 'completed' ]).optional(),
      startTime: z.string().datetime().optional(),
      endTime: z.string().datetime().optional(),
      userId: z.string().optional(),
      roomId: z.string().optional()
    });

    const validatedData = scheduleSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json({ error: validatedData.error.format() }, { status: 400 });
    }

    // Update the schedule
    const updatedSchedule = await prisma.schedule.update({
      where: { id },
      data: validatedData.data,
      include: {
        room: true,
        user: true
      }
    });

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE a schedule
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Check if schedule exists
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id }
    });

    if (!existingSchedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Add authorization check here

    // Delete the schedule
    await prisma.schedule.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
