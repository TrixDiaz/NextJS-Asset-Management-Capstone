import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

// Function to check DB connection
async function checkDbConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Function for safe queries with fallback
async function safeQuery<T>(
  queryFn: () => Promise<T>,
  fallbackFn?: () => Promise<T>
): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    console.error('Error executing Prisma query:', error);

    // Check if fallback function is provided
    if (fallbackFn) {
      try {
        return await fallbackFn();
      } catch (fallbackError) {
        console.error('Error executing fallback query:', fallbackError);
        throw fallbackError;
      }
    }

    throw error;
  }
}

// Schema validation for attendance submission
const attendanceSchema = z.object({
  scheduleId: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  section: z.string().min(1, 'Section is required'),
  yearLevel: z.string().min(1, 'Year level is required'),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  systemUnit: z.boolean(),
  keyboard: z.boolean(),
  mouse: z.boolean(),
  internet: z.boolean(),
  ups: z.boolean(),
  createTicket: z.boolean().optional()
});

export async function POST(req: NextRequest) {
  try {
    // Check database connection first
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 503 }
      );
    }

    // Get auth info but don't require it
    const { userId } = await auth();

    const body = await req.json();
    console.log('Request body:', body);

    const validatedData = attendanceSchema.safeParse(body);

    if (!validatedData.success) {
      console.log('Validation error:', validatedData.error.format());
      return NextResponse.json(
        { error: validatedData.error.format() },
        { status: 400 }
      );
    }

    const {
      scheduleId,
      firstName,
      lastName,
      email,
      section,
      yearLevel,
      subject,
      description,
      systemUnit,
      keyboard,
      mouse,
      internet,
      ups,
      createTicket
    } = validatedData.data;

    // Get the schedule to reference the room
    const schedule = await safeQuery(() =>
      prisma.schedule.findUnique({
        where: { id: scheduleId },
        include: {
          room: true,
          user: true
        }
      })
    );

    if (!schedule) {
      console.log('Schedule not found:', scheduleId);
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Check if all equipment is available
    const allEquipmentAvailable =
      systemUnit && keyboard && mouse && internet && ups;

    // Create attendance data with today's date
    const currentDate = new Date();
    const attendanceId = randomUUID();

    console.log('Creating attendance record with ID:', attendanceId);

    // Use safe query execution
    await safeQuery(
      // Primary method using executeRaw
      () => prisma.$executeRaw`
                INSERT INTO "Attendance" (
                    "id", "firstName", "lastName", "email", "section", "yearLevel", "subject", 
                    "date", "description", "systemUnit", "keyboard", "mouse", "internet", "ups", 
                    "scheduleId", "createdAt", "updatedAt"
                ) 
                VALUES (
                    ${attendanceId}, ${firstName}, ${lastName}, ${email}, ${section}, 
                    ${yearLevel}, ${subject}, ${currentDate}, ${description || null}, 
                    ${systemUnit}, ${keyboard}, ${mouse}, ${internet}, ${ups}, 
                    ${scheduleId}, NOW(), NOW()
                )
            `,
      // Fallback method
      async () => {
        // Try to use direct SQL through prisma.$queryRawUnsafe
        const query = `
                    INSERT INTO "Attendance" (
                        "id", "firstName", "lastName", "email", "section", "yearLevel", "subject", 
                        "date", "description", "systemUnit", "keyboard", "mouse", "internet", "ups", 
                        "scheduleId", "createdAt", "updatedAt"
                    ) 
                    VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()
                    )
                `;

        return prisma.$queryRawUnsafe(
          query,
          attendanceId,
          firstName,
          lastName,
          email,
          section,
          yearLevel,
          subject,
          currentDate,
          description || null,
          systemUnit,
          keyboard,
          mouse,
          internet,
          ups,
          scheduleId
        );
      }
    );

    console.log('Attendance record created successfully');

    // Construct the attendance data object for response
    const attendanceData = {
      id: attendanceId,
      firstName,
      lastName,
      email,
      section,
      yearLevel,
      subject,
      date: currentDate,
      description,
      systemUnit,
      keyboard,
      mouse,
      internet,
      ups,
      scheduleId,
      createdAt: currentDate,
      updatedAt: currentDate
    };

    // If not all equipment is available and createTicket is true, create a ticket (only if user is logged in)
    if (!allEquipmentAvailable && createTicket && userId) {
      // Create a title that summarizes the issue
      const issueItems: string[] = [];
      if (!systemUnit) issueItems.push('System Unit');
      if (!keyboard) issueItems.push('Keyboard');
      if (!mouse) issueItems.push('Mouse');
      if (!internet) issueItems.push('Internet');
      if (!ups) issueItems.push('UPS');

      const title = `Equipment Issue: ${issueItems.join(', ')} - ${firstName} ${lastName}`;

      try {
        // Find or create user in database
        let dbUser = await safeQuery(() =>
          prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
          })
        );

        // If user doesn't exist in database, create a basic record
        if (!dbUser) {
          dbUser = await safeQuery(() =>
            prisma.user.create({
              data: {
                clerkId: userId,
                role: 'member' // Default role
              },
              select: { id: true }
            })
          );
        }

        // Create ticket
        await safeQuery(() =>
          prisma.ticket.create({
            data: {
              title,
              description: `
Student: ${firstName} ${lastName}
Email: ${email}
Section: ${section}
Year Level: ${yearLevel}
Subject: ${subject}
Date: ${currentDate.toLocaleDateString()}
Room: ${schedule.room.number}

Missing/Non-functional Equipment:
${issueItems.join(', ')}

Additional Notes:
${description || 'No additional notes provided.'}
            `,
              status: 'OPEN',
              priority: 'MEDIUM',
              ticketType: 'ISSUE_REPORT',
              // Link to room
              roomId: schedule.roomId,
              // Use the database user ID
              createdById: dbUser.id
            }
          })
        );
        console.log('Ticket created successfully');
      } catch (error) {
        console.error('Error creating ticket:', error);
        // Continue even if ticket creation fails
      }
    } else if (!allEquipmentAvailable && createTicket && !userId) {
      console.log('Not creating ticket because user is not logged in');
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Attendance recorded successfully',
      data: attendanceData
    });
  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json(
      {
        error: 'Failed to record attendance',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check if database is connected
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: 'Database connection error', data: [] },
        { status: 503 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const scheduleId = searchParams.get('scheduleId');

    console.log('Query params:', { page, limit, startDate, endDate, scheduleId });

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where condition
    const where: any = {};

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate)
      };
    }

    if (scheduleId) {
      where.scheduleId = scheduleId;
    }

    // Count total records for pagination
    const totalRecords = await safeQuery(() =>
      prisma.attendance.count({ where })
    );

    // Fetch attendance records with pagination
    const attendanceRecords = await safeQuery(() =>
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          date: 'desc'
        },
        include: {
          schedule: {
            include: {
              user: true,
              room: true
            }
          }
        }
      })
    );

    console.log(`Found ${attendanceRecords.length} attendance records`);

    // Calculate total pages
    const totalPages = Math.ceil(totalRecords / limit);

    return NextResponse.json({
      success: true,
      data: attendanceRecords,
      pagination: {
        page,
        limit,
        total: totalRecords,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch attendance records',
        details: error instanceof Error ? error.message : String(error),
        data: []
      },
      { status: 500 }
    );
  }
}
