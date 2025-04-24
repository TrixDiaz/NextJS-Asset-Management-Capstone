import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// Add a safety check to ensure the Prisma client can execute queries
export async function checkDbConnection() {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Helper method to safely execute a Prisma query with proper error handling
export async function safeQuery<T>(
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
