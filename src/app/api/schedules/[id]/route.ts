import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for schedule update
const scheduleUpdateSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    startTime: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: "Start time must be a valid date string",
    }).optional(),
    endTime: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: "End time must be a valid date string",
    }).optional(),
    dayOfWeek: z.enum([ 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday' ]).optional(),
    roomId: z.string().optional(),
});

// GET a single schedule
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const schedule = await prisma.schedule.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                        email: true,
                    }
                },
                room: true
            }
        });

        if (!schedule) {
            return NextResponse.json(
                { error: 'Schedule not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(schedule);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        return NextResponse.json(
            { error: 'Failed to fetch schedule' },
            { status: 500 }
        );
    }
}

// PATCH update a schedule
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();

        // Check if schedule exists
        const scheduleExists = await prisma.schedule.findUnique({
            where: { id }
        });

        if (!scheduleExists) {
            return NextResponse.json(
                { error: 'Schedule not found' },
                { status: 404 }
            );
        }

        // Validate input
        const result = scheduleUpdateSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.format() },
                { status: 400 }
            );
        }

        const { data } = result;

        // If room is changing, check if it exists
        if (data.roomId && data.roomId !== scheduleExists.roomId) {
            const roomExists = await prisma.room.findUnique({
                where: { id: data.roomId }
            });

            if (!roomExists) {
                return NextResponse.json(
                    { error: 'Room not found' },
                    { status: 404 }
                );
            }
        }

        // Check for schedule conflicts if time, day or room is changing
        if (
            data.roomId ||
            data.dayOfWeek ||
            data.startTime ||
            data.endTime
        ) {
            const startTime = data.startTime ? new Date(data.startTime) : scheduleExists.startTime;
            const endTime = data.endTime ? new Date(data.endTime) : scheduleExists.endTime;
            const dayOfWeek = data.dayOfWeek || scheduleExists.dayOfWeek;
            const roomId = data.roomId || scheduleExists.roomId;

            const conflictingSchedule = await prisma.schedule.findFirst({
                where: {
                    id: { not: id },
                    roomId,
                    dayOfWeek,
                    OR: [
                        {
                            startTime: {
                                lte: endTime,
                            },
                            endTime: {
                                gte: startTime,
                            },
                        },
                    ],
                },
            });

            if (conflictingSchedule) {
                return NextResponse.json(
                    { error: 'Schedule conflicts with an existing booking' },
                    { status: 409 }
                );
            }
        }

        // Update the schedule
        const updateData: any = {};
        if (data.title) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.startTime) updateData.startTime = new Date(data.startTime);
        if (data.endTime) updateData.endTime = new Date(data.endTime);
        if (data.dayOfWeek) updateData.dayOfWeek = data.dayOfWeek;
        if (data.roomId) updateData.roomId = data.roomId;

        const updatedSchedule = await prisma.schedule.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                        email: true,
                    }
                },
                room: true
            }
        });

        return NextResponse.json(updatedSchedule);
    } catch (error) {
        console.error('Error updating schedule:', error);
        return NextResponse.json(
            { error: 'Failed to update schedule' },
            { status: 500 }
        );
    }
}

// DELETE a schedule
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check if schedule exists
        const scheduleExists = await prisma.schedule.findUnique({
            where: { id }
        });

        if (!scheduleExists) {
            return NextResponse.json(
                { error: 'Schedule not found' },
                { status: 404 }
            );
        }

        // Delete the schedule
        await prisma.schedule.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        return NextResponse.json(
            { error: 'Failed to delete schedule' },
            { status: 500 }
        );
    }
} 