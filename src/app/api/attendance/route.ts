import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { db, safeQuery, checkDbConnection } from '@/lib/db';
import { randomUUID } from 'crypto';

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
      db.schedule.findUnique({
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
      () => db.$executeRaw`
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
        // Try to use direct SQL through db.$queryRawUnsafe
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

        return db.$queryRawUnsafe(
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
          db.user.findUnique({
            where: { clerkId: userId },
            select: { id: true }
          })
        );

        // If user doesn't exist in database, create a basic record
        if (!dbUser) {
          dbUser = await safeQuery(() =>
            db.user.create({
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
          db.ticket.create({
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
    // Check database connection first
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 503 }
      );
    }

    // Don't require authentication for attendance records
    // Just try to get auth info but continue either way
    const { userId } = await auth();

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const scheduleId = searchParams.get('scheduleId');

    // Calculate pagination
    const skip = (page - 1) * limit;

    console.log('Fetching attendance records:', {
      page,
      limit,
      startDate,
      endDate,
      scheduleId
    });

    // Use safe query execution
    return await safeQuery(
      async () => {
        // Use raw SQL to fetch the attendance records
        let query = `
                SELECT a.*, 
                    s.title as "scheduleTitle", 
                    s."userId" as "scheduleUserId",
                    s."roomId" as "scheduleRoomId",
                    r.number as "roomNumber",
                    r.name as "roomName",
                    u."firstName" as "userFirstName",
                    u."lastName" as "userLastName"
                FROM "Attendance" a
                JOIN "Schedule" s ON a."scheduleId" = s.id
                JOIN "Room" r ON s."roomId" = r.id
                JOIN "User" u ON s."userId" = u.id
                WHERE 1=1
            `;

        const queryParams: any[] = [];
        let paramIndex = 1;

        if (scheduleId) {
          query += ` AND a."scheduleId" = $${paramIndex}`;
          queryParams.push(scheduleId);
          paramIndex++;
        }

        if (startDate) {
          query += ` AND a."date" >= $${paramIndex}`;
          queryParams.push(new Date(startDate));
          paramIndex++;
        }

        if (endDate) {
          query += ` AND a."date" <= $${paramIndex}`;
          queryParams.push(new Date(endDate));
          paramIndex++;
        }

        // Add sorting
        query += ` ORDER BY a."date" DESC`;

        // Add pagination
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limit, skip);

        // Execute the query
        const attendances = (await db.$queryRawUnsafe(
          query,
          ...queryParams
        )) as any[];

        // Count total records for pagination
        let countQuery = `
                SELECT COUNT(*) as total
                FROM "Attendance" a
                WHERE 1=1
            `;

        const countParams: any[] = [];
        paramIndex = 1;

        if (scheduleId) {
          countQuery += ` AND a."scheduleId" = $${paramIndex}`;
          countParams.push(scheduleId);
          paramIndex++;
        }

        if (startDate) {
          countQuery += ` AND a."date" >= $${paramIndex}`;
          countParams.push(new Date(startDate));
          paramIndex++;
        }

        if (endDate) {
          countQuery += ` AND a."date" <= $${paramIndex}`;
          countParams.push(new Date(endDate));
          paramIndex++;
        }

        const countResult = (await db.$queryRawUnsafe(
          countQuery,
          ...countParams
        )) as any[];
        const total = parseInt(countResult[0].total);

        console.log(
          `Found ${attendances.length} attendance records out of ${total} total`
        );

        // Format the results to match the expected structure
        const formattedAttendances = attendances.map((a: any) => ({
          id: a.id,
          firstName: a.firstName,
          lastName: a.lastName,
          email: a.email,
          section: a.section,
          yearLevel: a.yearLevel,
          subject: a.subject,
          date: a.date,
          description: a.description,
          systemUnit: a.systemUnit,
          keyboard: a.keyboard,
          mouse: a.mouse,
          internet: a.internet,
          ups: a.ups,
          scheduleId: a.scheduleId,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          schedule: {
            id: a.scheduleId,
            title: a.scheduleTitle,
            room: {
              id: a.scheduleRoomId,
              number: a.roomNumber,
              name: a.roomName
            },
            user: {
              id: a.scheduleUserId,
              firstName: a.userFirstName,
              lastName: a.userLastName
            }
          }
        }));

        return NextResponse.json({
          success: true,
          data: formattedAttendances,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        });
      },
      async () => {
        // Fallback implementation if the primary query fails
        return NextResponse.json(
          {
            success: false,
            error: 'Database query failed',
            data: [],
            pagination: {
              total: 0,
              page,
              limit,
              totalPages: 0
            }
          },
          { status: 500 }
        );
      }
    );
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch attendance records',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
