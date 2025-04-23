import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const { userId } = await auth();

  // Redirect to the overview page if user is authenticated
  // The middleware already handles redirecting to home page if not authenticated
  if (userId) {
    redirect('/dashboard/overview');
  }

  // This code should never run due to middleware protection
  return null;
}
