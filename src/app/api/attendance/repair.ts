import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Check if table exists
    const result = await db.$queryRaw`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'Attendance'
            ) as exists
        `;

    const tableExists =
      Array.isArray(result) && result.length > 0 && result[0].exists;

    if (!tableExists) {
      // Table doesn't exist, create it
      await db.$executeRaw`
                CREATE TABLE "Attendance" (
                    "id" TEXT NOT NULL,
                    "firstName" TEXT NOT NULL,
                    "lastName" TEXT NOT NULL,
                    "email" TEXT NOT NULL,
                    "section" TEXT NOT NULL,
                    "yearLevel" TEXT NOT NULL,
                    "subject" TEXT NOT NULL,
                    "date" TIMESTAMP(3) NOT NULL,
                    "description" TEXT,
                    "systemUnit" BOOLEAN NOT NULL,
                    "keyboard" BOOLEAN NOT NULL,
                    "mouse" BOOLEAN NOT NULL,
                    "internet" BOOLEAN NOT NULL,
                    "ups" BOOLEAN NOT NULL,
                    "scheduleId" TEXT NOT NULL,
                    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" TIMESTAMP(3) NOT NULL,

                    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
                )
            `;

      // Add foreign key
      await db.$executeRaw`
                ALTER TABLE "Attendance" 
                ADD CONSTRAINT "Attendance_scheduleId_fkey" 
                FOREIGN KEY ("scheduleId") 
                REFERENCES "Schedule"("id") 
                ON DELETE RESTRICT ON UPDATE CASCADE
            `;

      return NextResponse.json({
        success: true,
        message: 'Attendance table created successfully'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance table already exists',
      exists: tableExists
    });
  } catch (error) {
    console.error('Error repairing database:', error);
    return NextResponse.json(
      {
        success: false,
        error: String(error)
      },
      { status: 500 }
    );
  }
}
